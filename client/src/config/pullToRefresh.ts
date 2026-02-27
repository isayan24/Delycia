/**
 * Pull-to-Refresh Configuration Constants
 * 
 * These constants define the behavior and thresholds for the mobile pull-to-refresh feature.
 * Values are based on Requirements 9.1-9.5 from the mobile-pull-to-refresh specification.
 */

/**
 * Minimum pull distance (in pixels) required to trigger a refresh when the user releases.
 * @requirement 9.1
 */
export const REFRESH_THRESHOLD = 150

/**
 * Maximum pull distance (in pixels) before resistance is applied to further pulling.
 * @requirement 9.2
 */
export const MAX_PULL_DISTANCE = 240

/**
 * Resistance factor (0-1) applied to pull distance beyond MAX_PULL_DISTANCE.
 * A value of 0.3 means pulling 10 additional pixels only adds 3 pixels to tracked distance.
 * @requirement 9.3
 */
export const RESISTANCE_FACTOR = 0.3

/**
 * Minimum duration (in milliseconds) the loading indicator must remain visible,
 * even if queries complete faster. Ensures users perceive the refresh action.
 * @requirement 9.4
 */
export const MIN_LOADING_DURATION = 500

/**
 * Duration (in milliseconds) to display the error state before hiding the indicator.
 * @requirement 9.5
 */
export const ERROR_DISPLAY_DURATION = 2000

/**
 * Viewport width breakpoint (in pixels) that determines mobile vs desktop behavior.
 * Pull-to-refresh is enabled when viewport width is <= this value.
 */
export const MOBILE_BREAKPOINT = 900

/**
 * Horizontal movement threshold (in pixels) for detecting horizontal swipes.
 * If horizontal movement exceeds this value and is greater than vertical movement,
 * the pull gesture is cancelled to preserve normal horizontal scrolling.
 */
export const HORIZONTAL_THRESHOLD = 10

/**
 * Minimum pull distance (in pixels) before activating the pull gesture and showing the indicator.
 * This prevents the indicator from appearing during normal scrolling or accidental touches.
 * The user must pull down at least this distance before isPulling becomes true.
 */
export const PULL_ACTIVATION_THRESHOLD = 30
