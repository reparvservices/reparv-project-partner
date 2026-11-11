import React, { useState } from "react";
import { IoMdClose } from "react-icons/io";

export default function TagsInput({ newProperty, setPropertyData }) {
  const [inputValue, setInputValue] = useState("");

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      if (inputValue.trim() !== "") {
        const currentTags = newProperty.tags
          ? newProperty.tags.split(",").map((t) => t.trim())
          : [];
        if (!currentTags.includes(inputValue.trim())) {
          const updatedTags = [...currentTags, inputValue.trim()];
          setPropertyData({
            ...newProperty,
            tags: updatedTags.join(","), // store as comma-separated string
          });
        }
        setInputValue("");
      }
    }
  };

  const removeTag = (tag) => {
    const updatedTags = newProperty.tags
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t !== tag);
    setPropertyData({
      ...newProperty,
      tags: updatedTags.join(","),
    });
  };

  const tags = newProperty.tags
    ? newProperty.tags.split(",").map((t) => t.trim()).filter(Boolean)
    : [];

  return (
    <div className="w-full">
      <label
        className={`${
          newProperty.tags ? "text-[#5323DC]" : "text-[#00000066]"
        } block text-sm leading-4 font-medium`}
      >
        Tags <span className="text-red-600">*</span>
      </label>

      <div className="w-full mt-2 flex flex-wrap items-center gap-2 p-2 border border-[#00000033] rounded-[4px] focus-within:ring-2 focus-within:ring-violet-500">
        {tags.map((tag, index) => (
          <span
            key={index}
            className="bg-[#5323DC] text-white border-[1.5px] border-[#5323DC] rounded-2xl font-medium px-3 py-1 text-sm flex items-center gap-1"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="ml-1 text-white text-base font-bold"
            >
              <IoMdClose />
            </button>
          </span>
        ))}

        <input
          type="text"
          placeholder="Enter tag and ( press Enter )"
          className="flex-1 p-2 text-[16px] font-medium focus:outline-none placeholder:text-black"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>
    </div>
  );
}