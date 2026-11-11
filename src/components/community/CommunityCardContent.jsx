import { FiMessageCircle, FiHeart, FiBookmark, FiShare2 } from "react-icons/fi";

export default function CommunityCardContent({ title, body, image, location, replies, likes }) {
  return (
    <div className="space-y-3">
      <h3 className="font-semibold leading-snug">{title}</h3>

      <p className="text-sm text-muted-foreground line-clamp-3">
        {body}
      </p>

      {image && (
        <img
          src={image}
          alt={title}
          className="w-full h-44 object-contain rounded-xl"
        />
      )}

      {location && (
        <div className="text-xs text-muted-foreground">📍 {location}</div>
      )}

      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <FiMessageCircle /> {replies}
          </span>
          <span className="inline-flex items-center gap-1">
            <FiHeart /> {likes}
          </span>
        </div>

        <div className="flex items-center gap-3 text-muted-foreground">
          <FiBookmark className="cursor-pointer hover:text-violet-600" />
          <FiShare2 className="cursor-pointer hover:text-violet-600" />
        </div>
      </div>
    </div>
  );
}