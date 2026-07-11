// Match-facing service contract. Kept separate from the API transport so UI
// imports remain stable if the fixture provider changes.
export {
  getLiveMatches,
  getUpcomingMatches,
  getPopularMatches,
  getPopularLeagues,
  getMatchDetails,
} from "@/services/sports.service"
