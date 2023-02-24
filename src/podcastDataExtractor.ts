import * as cheerio from 'cheerio'
import { Request } from 'crawlee'
import { $PODCAST_AUTHOR, $PODCAST_CATEGORY, $PODCAST_DESCRIPTION, $PODCAST_EPISODES_NUMBER, $PODCAST_EPISODES_TIME_NODES, $PODCAST_LAST_EPISODE_NAME, $PODCAST_NAME, $PODCAST_RATING, DAYS_IN_HALF_A_YEAR, DAYS_IN_MONTH, DAYS_IN_WEEK, MS_IN_DAY } from './constants'
import { LastPosted, PodcastData, PostingFrequency } from './PodcastData'

const getTextBySelector = ($: cheerio.CheerioAPI, selector: string): string | null => {
  const text = $(selector).text().trim()
  return text.length ? text : null
}

const getNumberFromText = (text: string): number | null => {
  if (!text) return null
  
  let k = 1

  text = text.replaceAll(',', '').replaceAll(' ', '')

  if (text.includes('M') || text.includes('KK')) {
    text = text.replace('M', '').replace('KK', '')
    k *= 1000000
  }
  if (text.includes('K')) {
    text = text.replace('K', '')
    k *= 1000
  }

  return Number(text) * k
}

const toDoubleDigit = (t: number): string => t.toString().length == 1 ? `0${t}` : `${t}`

const toDateString = (date: Date): string => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  return `${year}-${toDoubleDigit(month)}-${toDoubleDigit(day)}`
}

const getDatesAvgDifferenceMs = (dates: Date[]): number => {
  if (dates.length === 0) return 0;
  const timestamps = dates.map((el) => el.getTime())
  const differencesSum = timestamps.map((ts, i) => ts - timestamps[i+1])
  differencesSum.pop()
  return differencesSum.reduce((a, b) => a + b, 0) / differencesSum.length
}

const getLastPosted = (days: number): LastPosted => {
  if (days <= DAYS_IN_WEEK) return 'less than a week ago'
  if (days <= DAYS_IN_MONTH) return 'less than a month ago'
  if (days <= DAYS_IN_HALF_A_YEAR) return 'over a month ago'
  return 'over 6 months ago'
}

const getPostingFrequency = (days: number): PostingFrequency => {
  if (days <= DAYS_IN_WEEK) return 'once a week'
  if (days <= DAYS_IN_MONTH) return 'once a month'
  if (days <= DAYS_IN_HALF_A_YEAR) return 'once in 6 months'
  return 'less than once in 6 months'
}

export const extractPodcastData = ($: cheerio.CheerioAPI, request: Request): PodcastData | null => {
  const Name = getTextBySelector($, $PODCAST_NAME)
  const Author = getTextBySelector($, $PODCAST_AUTHOR)
  const Category = getTextBySelector($, $PODCAST_CATEGORY)

  if (!Name && !Author && !Category) {
    return null
  }

  const [rating,,totalReviews] = getTextBySelector($, $PODCAST_RATING)?.split(' ') || []
  const [episodesNumber] = getTextBySelector($, $PODCAST_EPISODES_NUMBER)?.split(' ') || []

  const episodeDatetimes = $($PODCAST_EPISODES_TIME_NODES).toArray().map((el) => new Date(el.attribs.datetime))
  const datesAvgDiffMs = getDatesAvgDifferenceMs(episodeDatetimes)
  const avgDaysDiff = Math.floor(datesAvgDiffMs / MS_IN_DAY)
  const lastEpisodeDaysAgo = episodeDatetimes.length ? Math.floor((new Date().getTime() - episodeDatetimes[0].getTime()) / MS_IN_DAY) : null

  const Rating = Number(rating) || null
  const TotalReviews = getNumberFromText(totalReviews)
  const Link = request.url
  const TotalEpisodes = getNumberFromText(episodesNumber)
  const Description = getTextBySelector($, $PODCAST_DESCRIPTION)
  const LastEpisodeDate = episodeDatetimes[0] ? toDateString(episodeDatetimes[0]) : null
  const LastPosted = lastEpisodeDaysAgo != null ? getLastPosted(lastEpisodeDaysAgo) : null
  const PostingFrequency = lastEpisodeDaysAgo != null ? getPostingFrequency(avgDaysDiff) : null
  const LastEpisodeName = getTextBySelector($, $PODCAST_LAST_EPISODE_NAME)

  return {
    Name,
    Author,
    Category,
    Description,
    Rating,
    TotalReviews,
    Link,
    TotalEpisodes,
    LastEpisodeName,
    LastEpisodeDate,
    LastPosted,
    PostingFrequency
  }
}
