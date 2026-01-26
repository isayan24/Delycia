import axiosInstance from "@/lib/axios";

// Basic retry function with improved rate limiting
export const retryWithBackoff = async <T>(
  fn: () => Promise<T>, 
  retries = 3
): Promise<T> => {
  let attempts = 0;
  
  while (attempts <= retries) {
    try {
      // Just make the request directly
      const result = await fn();
      return result;
    } catch (error: any) {
      attempts++;
      
      // Log error details for debugging
      console.error(
        `API request failed (attempt ${attempts}/${retries + 1}):`, 
        error?.response?.status || 'No status'
      );
      
      // If we've used all retries, throw the error
      if (attempts > retries) {
        throw error;
      }
      
      // If it's a rate limit error, wait longer before retrying
      if (error?.response?.status === 429 || 
          (error?.message && error.message.includes("Too many requests"))) {
        // Exponential backoff: 500ms, 1000ms, 2000ms, etc.
        await new Promise(resolve => setTimeout(resolve, 500 * Math.pow(2, attempts - 1)));
      } else {
        // Brief delay for other errors
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    }
  }
  
  throw new Error("All retry attempts failed");
};

// Request queue to control concurrency
class RequestQueue {
  private queue: (() => Promise<any>)[] = [];
  private running = 0;
  private maxConcurrent: number;

  constructor(maxConcurrent = 5) {
    this.maxConcurrent = maxConcurrent;
  }

  enqueue<T>(task: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await task();
          resolve(result);
        } catch (error) {
          reject(error);
        }
        this.processNext();
      });

      this.processNext();
    });
  }

  private processNext() {
    if (this.running >= this.maxConcurrent || this.queue.length === 0) {
      return;
    }

    this.running++;
    const task = this.queue.shift();
    if (task) {
      task().finally(() => {
        this.running--;
        this.processNext();
      });
    }
  }
}

// Global request queue
const requestQueue = new RequestQueue(5);

// Wrapper for API calls with retry and queue
export const fetchWithRetry = async <T>(
  url: string, 
  options: any = {}
): Promise<T> => {
  // Add timeout to options if not already specified
  const requestOptions = {
    ...options,
    timeout: options.timeout || 8000, // 8 second timeout
  };

  return requestQueue.enqueue(() => 
    retryWithBackoff(
      () => axiosInstance.get(url, requestOptions).then(res => res.data)
    )
  );
};

// Process requests in parallel with controlled concurrency
export const parallelRequests = async <T, R>(
  items: T[],
  fetchFn: (item: T) => Promise<R>
): Promise<R[]> => {
  if (!items.length) return [];
  
  // Process requests through the queue
  const promises = items.map(item => 
    requestQueue.enqueue(async () => {
      try {
        return await fetchFn(item);
      } catch (error) {
        console.error("Error in parallel request:", error);
        return null as unknown as R;
      }
    })
  );
  
  // Wait for all to complete
  return Promise.all(promises);
}; 