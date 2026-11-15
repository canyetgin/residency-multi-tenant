import { buildSitemapEntries, SiteMapVideo, slugify } from "@/lib/seo"
import { MetadataRoute } from "next"
import { cacheLife, cacheTag } from "next/cache"

const NEXT_BUILD_DATE = new Date()

const STATIC_PATHS: `/${string}`[] = ["/", "/about", "/contact"]

type Post = {
  id: number
  title: string
  published_at: string
  edited_at: string | null
  cover_image: string | null
  videos: SiteMapVideo[] | null
}

const getCachedBlogSitemapEntries = async (): Promise<MetadataRoute.Sitemap> => {
  //considering ISR pages, so it wont generate only at build time even we add new slugs to blogs
  "use cache"
  cacheLife("days")
  cacheTag("sitemap-blog-entries")

  const res = await fetch("https://dev.to/api/articles")

  if (!res.ok) {
    //if you throw err, it will prevent caching on error states
    throw new Error(`Failed to fetch Dev.to articles: ${res.status}`)
  }

  const posts = (await res.json()) as Post[]

  return (posts ?? []).flatMap((post) => {
    const unicodeSlug = slugify(post.title)
    const lastModified = post?.edited_at || post?.published_at
    const images = post?.cover_image
    const videos = post?.videos

    return buildSitemapEntries({
      path: `/blog/${unicodeSlug}`,
      lastModified: lastModified ? new Date(lastModified) : undefined,
      images: images ?? undefined,
      videos: videos ?? undefined,
    })
  })
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const blogEntries = await getCachedBlogSitemapEntries()
  const staticEntries = STATIC_PATHS.flatMap((path) =>
    buildSitemapEntries({ path, lastModified: NEXT_BUILD_DATE })
  )

  return [...staticEntries, ...blogEntries]
}
