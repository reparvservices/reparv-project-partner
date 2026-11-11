import  CommunityCardHeader  from "./CommunityCardHeader";
import  CommunityCardContent  from "./CommunityCardContent";

export default function CommunityCard({ post }) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm border border-muted/40 space-y-3">
      <CommunityCardHeader
        avatar={post?.avatar}
        name={post?.author}
        role={post?.role}
        time={post?.time}
        badge={post?.badge}
      />

      <CommunityCardContent
        title={post?.title}
        body={post?.body}
        image={post?.image}
        location={post?.location}
        replies={post?.replies}
        likes={post?.likes}
      />
    </div>
  );
}