
import HomeHero from "../components/home/HomeHero"; 
import HomeStatsSection from "../components/home/HomeStatsSection"; 
import HomePartners from "../components/home/HomePartners"; 
import HomeSuccessStories from "../components/home/HomeSuccessStories"; 
import HomeHowToJoin from "../components/home/HomeHowToJoin"; 
import HomeFaqSection from "../components/home/HomeFaqSection"; 
import Button from "../components/ui/Button"; 
import AuthAlert from "../components/auth/AuthAlert"; 
import { usePlatformStatsQuery } from "../hooks/queries/usePlatformStatsQuery"; 
import { useCompletedOpportunitiesQuery } from "../hooks/queries/useCompletedOpportunitiesQuery"; 
 
export default function Home() { 
  const statsQuery = usePlatformStatsQuery(); 
  const completedQuery = useCompletedOpportunitiesQuery(); 
 
  const stats = statsQuery.data?.success 
    ? statsQuery.data.data 
    : null; 
 
  const completedOpportunities = completedQuery.data ?? []; 
 
  const statsLoading = statsQuery.isPending; 
  const opportunitiesLoading = completedQuery.isPending; 
 
  const statsError = statsQuery.isError; 
 
  return ( 
    <div className="bg-canvas text-heading"> 
      <HomeHero 
        volunteersCount={stats?.volunteersCount} 
        organizationsCount={stats?.organizationsCount} 
        loading={statsLoading} 
      /> 
 
      <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24"> 
        <div className="space-y-20 sm:space-y-24 lg:space-y-28"> 
          {statsError ? ( 
            <section className="flex flex-col items-start gap-3"> 
              <div className="w-full max-w-xl"> 
                <AuthAlert variant="error"> 
                  Failed to load platform statistics. 
                </AuthAlert> 
              </div> 
 
              <Button 
                variant="primary" 
                size="small" 
                onClick={() => statsQuery.refetch()} 
              > 
                Retry 
              </Button> 
            </section> 
          ) : ( 
            <HomeStatsSection 
              stats={stats} 
              loading={statsLoading} 
            /> 
          )} 
 
          <HomeSuccessStories 
            opportunities={completedOpportunities} 
            loading={opportunitiesLoading} 
            className="pt-2 sm:pt-4" 
          /> 
 
          {!opportunitiesLoading && completedOpportunities.length > 0 ? ( 
            <HomePartners 
              opportunities={completedOpportunities} 
            /> 
          ) : null} 
 
          <HomeHowToJoin /> 
 
          <HomeFaqSection /> 
        </div> 
      </main> 
    </div> 
  ); 
}