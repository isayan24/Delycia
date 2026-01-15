import ResLanding from "@/components/all-delycias/ResLanding";

export default async function RestaurantPage({ params, searchParams }: any) {
  const { username } = await params;
  const awaitedSearchParams = await searchParams;
  const restaurantId = awaitedSearchParams.id;

  // You can use either username or ID to fetch
  const identifier = username || restaurantId;

  if (!identifier) {
    return <div>Restaurant identifier not found</div>;
  }

  return <ResLanding rid={restaurantId} rname={username} />;
}
