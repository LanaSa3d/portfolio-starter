// Guards CV accuracy: every section of the provided CV must be present with the right counts.
import { describe, expect, test } from 'vitest';
import { cv } from './data/cv.js';

describe('CV completeness (matches Yara_Al-Mansouri_CV.pdf)', () => {
  test('header: name, 3 titles, location, phone, email and 8 profile links', () => {
    expect(cv.person.name).toBe('Yara Saud Al-Mansouri, PhD');
    expect(cv.person.titles).toEqual(['Principal Product Engineer', 'Design Technology Lead', 'HCI Researcher']);
    expect(cv.person.location).toBe('Riyadh, Saudi Arabia');
    expect(cv.person.phone).toBe('+966 55 000 0000');
    expect(cv.person.email).toBe('yara.almansouri@mail.example');
    expect(cv.person.links.map((l) => l.label)).toEqual(['Portfolio', 'LinkedIn', 'GitHub', 'Dribbble', 'Behance', 'Medium', 'Google Scholar', 'YouTube']);
  });

  test('summary and 8 career highlights', () => {
    expect(cv.summary).toMatch(/^Product engineer and designer with 16 years/);
    expect(cv.summary).toMatch(/PhD in Human-Computer Interaction focused on Arabic interfaces\.$/);
    expect(cv.highlights).toHaveLength(8);
  });

  test('10 core skill areas with level, years and tools', () => {
    expect(cv.skills).toHaveLength(10);
    cv.skills.forEach((s) => {
      expect(['Expert', 'Advanced', 'Intermediate']).toContain(s.level);
      expect(s.years).toBeGreaterThan(0);
      expect(s.tools.length).toBeGreaterThan(0);
    });
  });

  test('12 experience entries, newest first, including the career break', () => {
    expect(cv.experience).toHaveLength(12);
    expect(cv.experience[0].org).toBe('Faseela Ventures');
    expect(cv.experience.at(-1).role).toBe('Freelance Graphic and Web Designer (part-time)');
    expect(cv.experience.some((e) => e.role === 'Career Break')).toBe(true);
  });

  test('8 selected projects, each with problem, action, result, tech and a unique slug', () => {
    expect(cv.projects).toHaveLength(8);
    const slugs = new Set(cv.projects.map((p) => p.slug));
    expect(slugs.size).toBe(8);
    cv.projects.forEach((p) => {
      expect(p.slug).toMatch(/^[a-z0-9-]+$/);
      ['problem', 'action', 'result', 'period', 'role', 'team'].forEach((k) => expect(p[k], `${p.slug}.${k}`).toBeTruthy());
      expect(p.tech.length).toBeGreaterThan(0);
      expect(p.gallery.length).toBeGreaterThan(0);
    });
  });

  test('4 education entries', () => {
    expect(cv.education.map((e) => e.degree)).toEqual([
      'PhD in Human-Computer Interaction',
      'Executive Certificate in Technology Leadership',
      'MSc in Interaction Design, with Distinction',
      'BSc in Computer Science, First Class Honours',
    ]);
  });

  test('20 certifications: 19 earned with credential IDs, 1 in progress', () => {
    expect(cv.certifications.items).toHaveLength(20);
    expect(cv.certifications.items.filter((c) => c.id)).toHaveLength(19);
    expect(cv.certifications.items.filter((c) => c.status === 'In progress')).toHaveLength(1);
  });

  test('10 awards and 2 patents', () => {
    expect(cv.awards).toHaveLength(10);
    expect(cv.patents).toHaveLength(2);
  });

  test('6 of 9 publications, 8 of 31 talks and 4 media items', () => {
    expect(cv.publications.items).toHaveLength(6);
    expect(cv.publications.total).toBe(9);
    expect(cv.speaking.talks).toHaveLength(8);
    expect(cv.speaking.total).toBe(31);
    expect(cv.speaking.media).toHaveLength(4);
  });

  test('6 leadership roles, 5 languages and 4 interests', () => {
    expect(cv.leadership.items).toHaveLength(6);
    expect(cv.languages.map((l) => l.name)).toEqual(['Arabic', 'English', 'French', 'German', 'Turkish']);
    expect(cv.interests).toHaveLength(4);
  });

  test('awards and patents only link to projects that exist', () => {
    const slugs = new Set(cv.projects.map((p) => p.slug));
    [...cv.awards, ...cv.patents].filter((x) => x.project).forEach((x) => expect(slugs.has(x.project)).toBe(true));
  });
});
