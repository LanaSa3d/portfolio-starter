import React from 'react';

export function PortfolioMark() {
  return <img src={`${import.meta.env.BASE_URL}logos/yara.png`} alt="" width="112" height="112" />;
}

export function ProjectMark({ slug }) {
  return <span className="project-mark" aria-hidden="true"><img src={`${import.meta.env.BASE_URL}logos/${slug}.png`} alt="" width="64" height="64" loading="lazy" /></span>;
}
