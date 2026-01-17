import { fetchNotionBlocks } from "@/lib/notion/fetch";
import { parseBlocks } from "@/lib/notion/parser";
import { LazyImage } from "./LazyImage";
import { format } from "date-fns";

// full garden
const PAGE_ID = '2d11a1dec7c842cdac59e076aefccc59';
// temp dev page
// const PAGE_ID = '2eb58c1887f9803ea23dc58ff4be80be';

// export const revalidate = 60 * 60;

export default async function Home() {
  console.log('[ISR] Page rendering at:', new Date().toISOString());

  const blocks = await fetchNotionBlocks(PAGE_ID);

  if (!blocks?.results) {
    return <div>No blocks found</div>;
  }

  const websiteBlockGroups = await parseBlocks(blocks.results);
  const generatedAt = new Date().toISOString();


  return (
    <div className="flex flex-col gap-4 p-4 items-center my-16 w-full overflow-x-hidden">
      <h1 className="text-6xl mb-10 font-serif">Website Garden</h1>
      <p className="text-sm text-gray-300 mb-10 max-w-[600px] text-center">
        Over the years I&apos;ve grown a collection of well designed websites. From unique experiences full of eye catching animation to simple intuitive layouts, find some inspiration here.
      </p>
      {websiteBlockGroups.map((website) => (
        <div key={website.websiteUrl} className="flex flex-col gap-2 items-center bg-gray-100/10 p-4 rounded-md">
          <LazyImage
            className="rounded-md w-[600px]"
            src={website.imageUrl}
            alt={website.websiteUrl}
            width={600}
            height={400} />
          <div className="w-full flex justify-between items-center text-sm pt-4">
            <span className="font-light text-xs text-gray-500">added {format(new Date(website.createdTime), 'dd/MM/yyyy')}</span>
            <a href={website.websiteUrl} target="_blank" rel="noopener noreferrer">
              <span className="bg-gray-100/20 p-2 rounded-md hover:bg-gray-100/30 transition-all duration-300">visit website</span>
            </a>
          </div>
        </div>
      ))}

      <div className="text-sm text-gray-500 mt-10">Updated at {format(new Date(generatedAt), 'dd/MM/yyyy')}</div>
    </div>
  );
}