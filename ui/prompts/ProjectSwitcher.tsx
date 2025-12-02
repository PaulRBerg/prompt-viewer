"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { tv } from "tailwind-variants";
import type { ProjectConfig, ProjectSlug } from "@/lib/prompts/types";

const tabStyles = tv({
  base: "relative cursor-pointer px-4 py-2 font-medium text-sm transition-colors",
  variants: {
    active: {
      false: "text-muted hover:text-foreground",
      true: "text-[#C47D5A]",
    },
  },
});

const indicatorStyles = tv({
  base: "absolute bottom-0 left-0 h-0.5 bg-[#C47D5A] transition-all duration-300 ease-out",
});

type ProjectSwitcherProps = {
  projects: ProjectConfig[];
  activeProject: ProjectSlug;
  onSelect: (slug: ProjectSlug) => void;
};

export function ProjectSwitcher({ projects, activeProject, onSelect }: ProjectSwitcherProps) {
  const activeIndex = projects.findIndex((p) => p.slug === activeProject);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });

  useLayoutEffect(() => {
    const activeTab = tabRefs.current[activeIndex];
    if (activeTab) {
      setIndicator({
        left: activeTab.offsetLeft,
        width: activeTab.offsetWidth,
      });
    }
  }, [activeIndex]);

  return (
    <div className="relative border-border border-b">
      <div className="flex gap-2">
        {projects.map((project, index) => (
          <button
            key={project.slug}
            ref={(el) => {
              tabRefs.current[index] = el;
            }}
            type="button"
            onClick={() => onSelect(project.slug)}
            className={tabStyles({ active: project.slug === activeProject })}
          >
            {project.name}
          </button>
        ))}
      </div>
      {activeIndex !== -1 && indicator.width > 0 && (
        <div
          className={indicatorStyles()}
          style={{
            transform: `translateX(${indicator.left}px)`,
            width: `${indicator.width}px`,
          }}
        />
      )}
    </div>
  );
}
