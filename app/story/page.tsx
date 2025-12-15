import { StoryGallery } from "@/components/StoryGallery";
import { getStories } from "@/features/stories/api/stories";

export const dynamic = 'force-dynamic';

export default async function StoryPage() {
  const result = await getStories();
  const stories = result.success && result.data ? result.data : [];

  return <StoryGallery initialStories={stories} />;
}

