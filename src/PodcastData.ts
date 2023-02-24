export type LastPosted = 'less than a week ago' | 'less than a month ago' | 'over a month ago' | 'over 6 months ago'

export type PostingFrequency = 'once a week' | 'once a month' | 'once in 6 months' | 'less than once in 6 months'

export interface PodcastData {
  Link: string
  Name: string | null
  Description: string | null
  Author: string | null
  Category: string | null
  TotalReviews: number | null
  Rating: number | null
  TotalEpisodes: number | null
  LastEpisodeDate: string | null
  LastEpisodeName: string | null
  LastPosted: LastPosted | null
  PostingFrequency: PostingFrequency | null
}

export interface PodcastDataWithInfo {
  ScrapedAt: string
}
