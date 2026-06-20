import { useQuery } from "@tanstack/react-query"
import { getPatternsAction } from "@/lib/actions/patterns"

export function useGetPatterns() {
  return useQuery({
    queryKey: ["keyPatterns"],
    queryFn: getPatternsAction,
    staleTime: 10 * 60 * 1000, // 10 minutes cache
  })
}
