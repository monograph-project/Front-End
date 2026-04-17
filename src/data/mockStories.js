export const MOCK_STORIES = [
  {
    id: "1",
    title: "Designing for Focus in a Noisy Digital World",
    subtitle:
      "How we structure reading and writing so students and faculty can think clearly.",
    author_name: "Faculty Commons",
    created_date: "2026-03-28T10:00:00.000Z",
    reading_time: 6,
    claps_count: 128,
    cover_image:
      "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1200&q=80",
    tags: ["Design", "Education", "Writing"],
    content: `
      <p>In today's digital landscape, focus is the ultimate currency. But with notifications, social feeds, and endless tabs, how do we create spaces for deep thinking?</p>
      
      <h2>The Problem: Cognitive Overload</h2>
      <p>Our brains aren't wired for constant context-switching. Studies show it takes <strong>23 minutes</strong> to regain deep focus after an interruption. Educational platforms compound this with cluttered interfaces and competing priorities.</p>
      
      <ul>
        <li>Multiple navigation layers confuse users</li>
        <li>Mixed public/private content creates cognitive dissonance</li>
        <li>No clear reading/writing modes</li>
      </ul>
      
      <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80" alt="Focused reading environment" loading="lazy">
      
      <blockquote>
        <p>"Simple design is both obvious and invisible." — Steve Krug</p>
      </blockquote>
      
      <h2>Our Solution: Intentional Layers</h2>
      <p>We separate <em>public stories</em> (Medium-style) from <em>private coursework</em>. Clean reading surfaces, distraction-free writing, and contextual sidebars only when needed.</p>
      
      <h3>Key Principles</h3>
      <ol>
        <li>Progressive disclosure — show only what's relevant</li>
        <li>Single reading flow — full-screen content by default</li>
        <li>Role-based surfaces — students see classwork, faculty see analytics</li>
      </ol>
      
      <pre><code className="language-js">const focus = () => {
  return distractionFree();
};</code></pre>
      
      <p>This structure scales from individual stories to campus-wide knowledge sharing.</p>
    `.trim(),
  },
  {
    id: "2",
    title: "Why Group Projects Need Clear Roles",
    subtitle:
      "A practical framework for repositories, invites, and teacher oversight.",
    author_name: "Dr. A. Rahman",
    created_date: "2026-04-02T14:30:00.000Z",
    reading_time: 5,
    claps_count: 64,
    tags: ["Collaboration", "Teaching"],
    content: `
      <p>Group projects fail 70% of the time. Why? Ambiguous roles, misaligned expectations, and no accountability mechanisms.</p>
      
      <h2>The Framework</h2>
      
      <table>
        <thead>
          <tr><th>Role</th><th>Responsibilities</th></tr>
        </thead>
        <tbody>
          <tr><td>Lead</td><td>Timeline, repo access</td></tr>
          <tr><td>Researcher</td><td>Sources, story drafts</td></tr>
          <tr><td>Editor</td><td>Polish, claps review</td></tr>
        </tbody>
      </table>
      
      <h3>Teacher Oversight</h3>
      <p>Faculty approve members, monitor progress via dashboard, and moderate public publication.</p>
      
      <figure>
        <img src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=600&q=80" alt="Team collaboration">
        <figcaption>Clear roles = smooth collaboration</figcaption>
      </figure>
    `.trim(),
  },
  {
    id: "3",
    title: "From Topic to Thread: Writing Like Medium",
    subtitle:
      "Public stories sit beside private coursework — here is how we separate them.",
    author_name: "Student Voice",
    created_date: "2026-04-08T09:15:00.000Z",
    reading_time: 4,
    claps_count: 41,
    tags: ["Productivity", "Community"],
    content: `
      <p>Medium succeeded by making writing effortless. We're bringing that to education.</p>
      
      <h2>Public vs Private</h2>
      
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
        <div>
          <h3>Public Stories</h3>
          <ul>
            <li>Medium-style publishing</li>
            <li>Claps and discovery</li>
            <li>Anyone can read</li>
          </ul>
        </div>
        <div>
          <h3>Private Coursework</h3>
          <ul>
            <li>Class-only repositories</li>
            <li>Teacher moderation</li>
            <li>Grade integration</li>
          </ul>
        </div>
      </div>
      
      <h2>The Writing Experience</h2>
      <p>Rich editor, auto-save, preview mode, one-click publish to public or private.</p>
    `.trim(),
  },
  {
    id: "4",
    title: "Staff Workflows That Scale Across Departments",
    subtitle: "Notes, calendar, and reports for everyday faculty operations.",
    author_name: "Ops Team",
    created_date: "2026-04-10T16:00:00.000Z",
    reading_time: 7,
    claps_count: 22,
    tags: ["Operations", "Faculty"],
    content: `
      <p>Faculty need tools that work across departments without constant retraining.</p>
      
      <h2>Unified Dashboard</h2>
      <p>Stories, calendar events, student analytics — all in one place.</p>
      
      <h3>Daily Workflow</h3>
      1. Review class stories
      2. Approve group publications  
      3. Check attendance via calendar
      4. Export reports
      5. Share insights publicly
      
      <h2>Scalability Features</h2>
      <ul>
        <li>Role-based permissions</li>
        <li>Department silos</li>
        <li>Campus-wide search</li>
        <li>Analytics export</li>
      </ul>
      
      <img src="https://images.unsplash.com/photo-1551836022-4ce78478a77d?w=800&q=80" alt="Faculty dashboard" loading="lazy">
    `.trim(),
  },
];

export function getStoryById(id) {
  return MOCK_STORIES.find((s) => String(s.id) === String(id)) ?? null;
}

export function storiesForTopic(topic) {
  if (!topic) return MOCK_STORIES;
  const t = decodeURIComponent(topic).toLowerCase();
  return MOCK_STORIES.filter((s) =>
    s.tags?.some((tag) => tag.toLowerCase() === t),
  );
}
