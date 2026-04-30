"use client";

import { Pencil } from "lucide-react";
import { useState } from "react";
import useDraftStore from "@/stores/draftStore";

export default function EditableTeamName({ side }) {
  const [isEditing, setIsEditing] = useState(false);
  const { blueTeamName, redTeamName, setTeamName, user, draftId, draftOwnerId } =
    useDraftStore();
  const isReadOnly = Boolean(draftId && user?.id !== draftOwnerId);

  const isBlue = side === "blue";
  const value = isBlue ? blueTeamName : redTeamName;
  const accentColor = isBlue ? "blue" : "red";

  if (isEditing && !isReadOnly) {
    return (
      <input
        autoFocus
        value={value}
        onChange={(e) => setTeamName(side, e.target.value)}
        onBlur={() => setIsEditing(false)}
        onKeyDown={(e) => e.key === "Enter" && setIsEditing(false)}
        maxLength={64}
        className={`w-full bg-white/5 border-b border-${accentColor}-500 outline-none text-2xl font-black italic tracking-tighter text-${accentColor}-400 placeholder:text-${accentColor}-400/50 px-2 py-1 rounded-t-md ${!isBlue ? "text-right" : ""}`}
        placeholder={isBlue ? "Blue Team" : "Red Team"}
      />
    );
  }

  return (
    <div className={`flex items-center group gap-2 ${!isBlue ? "justify-end" : ""}`}>
      {!isBlue && !isReadOnly && (
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          className={`transition-opacity p-1 hover:bg-white/5 rounded-md text-${accentColor}-400/50 hover:text-${accentColor}-400`}
        >
          <Pencil size={16} />
        </button>
      )}
      <h2 className={`text-2xl font-black italic tracking-tighter text-${accentColor}-400`}>
        {value}
      </h2>
      {isBlue && !isReadOnly && (
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          className={`transition-opacity p-1 hover:bg-white/5 rounded-md text-${accentColor}-400/50 hover:text-${accentColor}-400`}
        >
          <Pencil size={16} />
        </button>
      )}
    </div>
  );
}
