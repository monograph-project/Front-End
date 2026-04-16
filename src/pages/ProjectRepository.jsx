import React, { useState } from "react";


const ProjectRepository = () => {

    const [activeTab, setActiveTab] = useState("code");

    return (
        <div className="w-full">

            {/* NAVBAR */}
            <div className="border-b border-gray-300 bg-white">
                <nav className="flex items-center gap-8 text-sm px-10 py-2">

                    <TabButton label="Code" tab="code" activeTab={activeTab} setActiveTab={setActiveTab} />
                    <TabButton label="Issues" tab="issues" activeTab={activeTab} setActiveTab={setActiveTab} />
                    <TabButton label="Pull Requests" tab="pulls" activeTab={activeTab} setActiveTab={setActiveTab} />
                    <TabButton label="Agents" tab="agents" activeTab={activeTab} setActiveTab={setActiveTab} />
                    <TabButton label="Actions" tab="actions" activeTab={activeTab} setActiveTab={setActiveTab} />
                    <TabButton label="Projects" tab="projects" activeTab={activeTab} setActiveTab={setActiveTab} />
                    <TabButton label="Security" tab="security" activeTab={activeTab} setActiveTab={setActiveTab} />
                    <TabButton label="Settings" tab="settings" activeTab={activeTab} setActiveTab={setActiveTab} />

                </nav>
            </div>

            {/* PAGE CONTENT */}
            <div className="p-6">

                {activeTab === "code" && <CodePage />}
                {activeTab === "issues" && <IssuesPage />}
                {activeTab === "pulls" && <PullsPage />}
                {activeTab === "agents" && <AgentsPage />}
                {activeTab === "actions" && <ActionsPage />}
                {activeTab === "projects" && <ProjectsPage />}
                {activeTab === "security" && <SecurityPage />}
                {activeTab === "settings" && <SettingsPage />}

            </div>

        </div>
    );
};

export default ProjectRepository;

/* ---------------- TAB BUTTON ---------------- */

const TabButton = ({ label, tab, activeTab, setActiveTab }) => {
    return (
        <div
            onClick={() => setActiveTab(tab)}
            className={`cursor-pointer py-3 px-1 border-b-2 transition-all duration-200
            ${activeTab === tab
                ? "border-orange-500 font-semibold text-black"
                : "border-transparent text-gray-600 hover:text-blue-600 hover:border-blue-600"
            }`}
        >
            {label}
        </div>
    );
};

/* ---------------- PAGES ---------------- */

/*----------Code pagge--------*/
const CodePage = () => {
  const [selectedPath, setSelectedPath] = useState('');
  const [expandedDirs, setExpandedDirs] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [branch, setBranch] = useState('main');

  // Mock file tree from project structure
        const fileTree = [
    {
      name: 'Monograph',
      type: 'dir',
      path: '/',
      children: [
        { name: 'TODO.md', type: 'file', path: '/TODO.md', language: 'md' },
        { name: 'Front-End', type: 'dir', path: '/Front-End', children: [
          { name: 'package.json', type: 'file', path: '/Front-End/package.json', language: 'json' },
          { name: 'index.html', type: 'file', path: '/Front-End/index.html', language: 'html' },
          { name: 'src', type: 'dir', path: '/Front-End/src', children: [
            { name: 'App.jsx', type: 'file', path: '/Front-End/src/App.jsx', language: 'jsx' },
            { name: 'main.jsx', type: 'file', path: '/Front-End/src/main.jsx', language: 'jsx' },
            { name: 'pages', type: 'dir', path: '/Front-End/src/pages', children: [
              { name: 'ProjectRepository.jsx', type: 'file', path: '/Front-End/src/pages/ProjectRepository.jsx', language: 'jsx' },
              { name: 'Dashboard.jsx', type: 'file', path: '/Front-End/src/pages/Dashboard.jsx', language: 'jsx' },
              { name: 'Deals.jsx', type: 'file', path: '/Front-End/src/pages/Deals.jsx', language: 'jsx' },
              // More pages...
            ]},
            { name: 'components', type: 'dir', path: '/Front-End/src/components', children: [
              { name: 'Button.jsx', type: 'file', path: '/Front-End/src/components/Button.jsx', language: 'jsx' },
              { name: 'Table.jsx', type: 'file', path: '/Front-End/src/components/Table.jsx', language: 'jsx' },
              { name: 'Dropdown.jsx', type: 'file', path: '/Front-End/src/components/Dropdown.jsx', language: 'jsx' },
            ]},
            { name: 'context', type: 'dir', path: '/Front-End/src/context', children: [
              { name: 'AuthContext.jsx', type: 'file', path: '/Front-End/src/context/AuthContext.jsx', language: 'jsx' }
            ]}
          ]}
        ]}
      ]
    }
  ];

// Enhanced file content w/ syntax spans for colors
  const getFileContent = (path) => {
    const contents = {
      '/src/pages/ProjectRepository.jsx': `import <span class="text-blue-400">React</span>, { <span class="text-blue-400">useState</span> } from <span class="text-green-400">"react"</span>;
<span class="text-green-400">// GitHub-style code page</span>
<span class="text-orange-400">const</span> <span class="text-purple-400">ProjectRepository</span> = () => {
  <span class="text-green-400">// Full implementation with tree viewer</span>
  <span class="text-orange-400">const</span> [activeTab, setActiveTab] = <span class="text-blue-400">useState</span>(<span class="text-green-400">"code"</span>);
  <span class="text-orange-400">return</span> (
    <<span class="text-purple-400">div</span> className=<span class="text-green-400">"w-full"</span>>
      {/* Tabs like GitHub */}
    </<span class="text-purple-400">div</span>>
  );
};`,
      '/package.json': `{
  <span class="text-green-400">"name"</span>: <span class="text-green-400">"front-end"</span>,
  <span class="text-green-400">"version"</span>: <span class="text-green-400">"0.0.0"</span>,
  <span class="text-green-400">"dependencies"</span>: {
    <span class="text-green-400">"react"</span>: <span class="text-green-400">"^19.2.0"</span>
  }
}`,
      '/src/App.jsx': `<span class="text-orange-400">import</span> React <span class="text-orange-400">from</span> <span class="text-green-400">'react'</span>;
<span class="text-orange-400">function</span> <span class="text-purple-400">App</span>() {
  <span class="text-orange-400">return</span> (
    <<span class="text-purple-400">div</span>>Monograph App</<span class="text-purple-400">div</span>>
  );
}
<span class="text-orange-400">export default</span> App;`
    };
    return contents[path] || '// No content - GitHub 404 mock';
  };

  const getLineContent = (path) => getFileContent(path).split('\n');

  const toggleDir = (path) => {
    const newExpanded = new Set(expandedDirs);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedDirs(newExpanded);
  };

  const selectFile = (path) => {
    setSelectedPath(path);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50 text-gray-900 font-mono">

      {/* Top Repo Navbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-gray-200 shrink-0">
        <div className="flex items-center gap-2 text-lg font-semibold text-gray-900">
          <span>📁</span>
          <span>Front-End</span>
        </div>
        <div className="flex items-center gap-2">
          <select className="text-sm border border-gray-300 rounded px-2 py-1">
            <option>{branch}</option>
          </select>
          <button className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 border rounded text-gray-700">+ New</button>
          <div className="flex gap-1">
            <button className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 border rounded text-gray-700 flex items-center gap-1">👁 Watch</button>
            <button className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 border rounded text-gray-700 flex items-center gap-1">⭐ Star</button>
            <button className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 border rounded text-gray-700 flex items-center gap-1">🍴 Fork</button>
          </div>
        </div>
      </div>

      {/* GitHub Dual Table Layout */}
      <div className="flex flex-1 overflow-hidden border-t border-gray-200">
        {/* Left Files Table 70% w/ gray border */}
        <div className="w-3/4 border-r border-gray-200 bg-white">
          <table className="w-full">
            <thead className="sticky top-0 bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-8"></th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell w-32">Last commit</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">Message</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {(() => {
                const getAllFiles = (node) => {
                  let files = [];
                  if (node.type === 'file') {
                    files.push(node);
                  } else if (node.children) {
                    node.children.forEach(child => files.push(...getAllFiles(child)));
                  }
                  return files;
                };
                return getAllFiles(fileTree[0]).slice(0,20).map((file, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-mono">
                      {file.type === 'file' ? '📄' : '📁'}
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm font-mono text-blue-600 hover:underline cursor-pointer max-w-xs truncate">{file.name}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">abc1234</td>
                    <td className="px-4 py-4 text-sm text-gray-900 max-w-xs truncate">feat: update repo viewer</td>
                  </tr>
                ));
              })()}
            </tbody>
          </table>
        </div>
        {/* Right Commits Table 30% no border */}
        <div className="w-1/4 bg-white">
          <table className="w-full">
            <thead className="sticky top-0 bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Commits</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {[
                {hash: 'abc1234', author: 'You', msg: 'feat: github tables', date: '2min'},
                {hash: 'def5678', author: 'You', msg: 'init code page', date: '1h'},
                {hash: 'ghi9012', author: 'You', msg: 'setup repo', date: '2d'}
              ].map((commit, i) => (
                <tr key={i} className="hover:bg-gray-50 cursor-pointer">
                  <td className="px-4 py-4">
                    <div className="text-xs font-mono text-gray-900 truncate">{commit.hash.slice(0,7)}</div>
                    <div className="text-xs text-gray-500">{commit.author}</div>
                    <div className="text-sm font-medium">{commit.msg}</div>
                    <div className="text-xs text-gray-500">{commit.date}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

// Temp FileTreeNode component (will expand)
const FileTreeNode = ({ node, expanded, onToggle, onSelect, search }) => {
  const matchesSearch = node.name.toLowerCase().includes(search.toLowerCase());
  if (!matchesSearch && search) return null;

  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = expanded.has(node.path);

  return (
    <div>
      <div 
        className={`px-3 py-1 text-sm cursor-pointer hover:bg-gray-100 flex items-center gap-2 ${
          node.type === 'file' ? 'pl-8' : ''
        }`}
        onClick={() => node.type === 'file' ? onSelect(node.path) : onToggle(node.path)}
      >
        <span>{node.type === 'dir' ? (isExpanded ? '📂' : '📁') : '📄'}</span>
        <span>{node.name}</span>
      </div>
      {hasChildren && isExpanded && (
        <div className="ml-4">
          {node.children.map((child, i) => (
            <FileTreeNode key={i} {...{node: child, expanded, onToggle, onSelect, search}} />
          ))}
        </div>
      )}
    </div>
  );
};






/*---------------issuesPage------------*/

import {
  MagnifyingGlassIcon,
  TagIcon,
  FlagIcon,
  ChevronDownIcon,
  FunnelIcon,
  ArrowsUpDownIcon,
  CheckCircleIcon,
  CodeBracketIcon,
  ChatBubbleLeftIcon,
  ScissorsIcon,
} from "@heroicons/react/24/outline";


const IssuesPage = () => {
  const [showLabels, setShowLabels] = useState(false);
  const [showMilestones, setShowMilestones] = useState(false);

  const issues = [
    { id: 1, title: "Login page bug", status: "open" },
    { id: 2, title: "Fix navbar UI", status: "open" },
  ];

  return (
    <div className="p-6 bg-[#f6f8fa] min-h-screen text-sm">

      {/* Top Bar */}
      <div className="flex items-center gap-3 mb-4">

        {/* Search */}
        <div className="flex items-center w-[65%] border border-gray-300 rounded-md px-3 py-2 bg-white">
          <input
            type="text"
            defaultValue="is:issue state:open"
            className="w-full outline-none"
          />
          <MagnifyingGlassIcon className="w-5 h-5 text-gray-500" />
        </div>

        {/* Labels Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowLabels(!showLabels)}
            className="flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-md bg-white"
          >
            <TagIcon className="w-4 h-4" />
            Labels
            <ChevronDownIcon className="w-4 h-4" />
          </button>

          {showLabels && (
            <div className="absolute mt-2 w-40 bg-white border rounded-md shadow-md p-2">
              <p className="hover:bg-gray-100 p-1 cursor-pointer">bug</p>
              <p className="hover:bg-gray-100 p-1 cursor-pointer">feature</p>
            </div>
          )}
        </div>

        {/* Milestones Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowMilestones(!showMilestones)}
            className="flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-md bg-white"
          >
            <FlagIcon className="w-4 h-4" />
            Milestones
            <ChevronDownIcon className="w-4 h-4" />
          </button>

          {showMilestones && (
            <div className="absolute mt-2 w-40 bg-white border rounded-md shadow-md p-2">
              <p className="hover:bg-gray-100 p-1 cursor-pointer">v1.0</p>
              <p className="hover:bg-gray-100 p-1 cursor-pointer">v2.0</p>
            </div>
          )}
        </div>

        {/* New Issue */}
        <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
          New issue
        </button>
      </div>

      {/* Issues Box */}
      <div className="border border-gray-300 rounded-md bg-white">

        {/* Header */}
        <div className="flex justify-between px-4 py-3 border-b text-gray-600">

          {/* Tabs */}
          <div className="flex gap-4">
            <span className="font-semibold text-black">Open {issues.length}</span>
            <span>Closed 0</span>
          </div>

          {/* Filters */}
          <div className="flex gap-4">
            <span>Author ▾</span>
            <span>Labels ▾</span>
            <span>Projects ▾</span>
            <span>Milestones ▾</span>
            <span>Assignees ▾</span>
            <span>Types ▾</span>
            <span>Newest ▾</span>
          </div>
        </div>

        {/* Issues List */}
        {issues.length > 0 ? (
          issues.map((issue) => (
            <div
              key={issue.id}
              className="px-4 py-3 border-b hover:bg-gray-50 cursor-pointer"
            >
              <p className="font-medium">{issue.title}</p>
              <p className="text-gray-500 text-xs">#{issue.id} opened</p>
            </div>
          ))
        ) : (
          <div className="text-center py-16">
            <h2 className="text-lg font-semibold">No results</h2>
            <p className="text-gray-500 mt-2">
              Try adjusting your search filters.
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="text-right mt-4 text-gray-500 underline cursor-pointer">
        Give feedback
      </div>
    </div>
  );
};



/*----------------PullPages------------*/



const PullsPage = () => {
  const [showFilters, setShowFilters] = useState(false);
  const [showSort, setShowSort] = useState(false);
  const [query, setQuery] = useState("is:pr is:open");
  const [sortBy, setSortBy] = useState("newest");

  const pulls = [
    { 
      id: 42, 
      title: "Add authentication system with JWT and role-based access", 
      base: "main", 
      head: "feature/auth", 
      author: "john-doe", 
      avatar: "JD", 
      date: "2 days ago", 
      status: "open",
      commits: 5,
      files: 12,
      comments: 3,
      hasConflicts: false
    },
    { 
      id: 41, 
      title: "Improve dashboard UI with new charts and responsive design", 
      base: "main", 
      head: "feat/dashboard-ui", 
      author: "jane-smith", 
      avatar: "JS", 
      date: "5 days ago", 
      status: "open",
      commits: 8,
      files: 25,
      comments: 1,
      hasConflicts: true
    },
    { 
      id: 40, 
      title: "Fix mobile navigation bugs", 
      base: "main", 
      head: "bugfix/mobile-nav", 
      author: "alex-wilson", 
      avatar: "AW", 
      date: "1 week ago", 
      status: "merged",
      commits: 3,
      files: 4,
      comments: 0,
      hasConflicts: false
    }
  ];

  const sortOptions = ["Newest", "Oldest", "Author", "Most comments"];

  const openCount = pulls.filter(p => p.status === "open").length;
  const mergedCount = pulls.filter(p => p.status === "merged").length;
  const closedCount = pulls.filter(p => p.status === "closed").length;

  return (
    <div className="p-4 sm:p-6 bg-[#f6f8fa] min-h-screen text-xs sm:text-sm font-sans">

      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mb-4 sm:mb-6">
        {/* Filter & Sort - Stack on mobile */}
        <div className="flex flex-col sm:flex-row gap-2 flex-1">
          {/* Filter Button with count */}
          <div className="relative flex-1">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="w-full flex items-center justify-center sm:justify-start gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm border border-[#d0d7de] rounded-md sm:rounded-l-md bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              aria-label="Filter pull requests"
            >
              <FunnelIcon className="w-4 h-4 flex-shrink-0 text-gray-700" />
              <span>Filter</span>
              <span className="ml-1 px-1.5 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full font-medium hidden sm:inline">2</span>
            </button>
            {showFilters && (
              <div className="absolute top-full left-0 mt-1 w-full sm:w-48 bg-white border border-gray-200 rounded-md shadow-lg z-20 py-1 max-h-60 overflow-y-auto">
                {["Open PRs", "Merged", "Closed", "Draft"].map((f, i) => (
                  <button
                    key={i}
                    className="w-full text-left px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-700 hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
                    onClick={() => {
                      setQuery(`is:pr ${f.toLowerCase().replace(/s$/, "").replace(" ", "-")}`);
                      setShowFilters(false);
                    }}
                  >
                    {f}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="relative flex-1 sm:flex-none">
            <button
              onClick={() => setShowSort(!showSort)}
              className="w-full flex items-center justify-center sm:justify-start gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm border border-[#d0d7de] rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <ArrowsUpDownIcon className="w-4 h-4 flex-shrink-0 text-gray-700" />
              <span className="truncate">Sort: {sortBy}</span>
              <ChevronDownIcon className="w-4 h-4 text-gray-700 ml-1 transition-transform" />
            </button>
            {showSort && (
              <div className="absolute top-full left-0 mt-1 w-full sm:w-40 bg-white border border-gray-200 rounded-md shadow-lg z-20 py-1 max-h-60 overflow-y-auto">
                {sortOptions.map((option, i) => (
                  <button
                    key={i}
                    className="w-full text-left px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-700 hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
                    onClick={() => {
                      setSortBy(option.toLowerCase().replace(" ", "-"));
                      setShowSort(false);
                    }}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative flex-1 w-full max-w-md sm:max-w-2xl order-first sm:order-none">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            type="text"
            className="w-full pl-10 pr-4 py-2 border border-[#d0d7de] rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="is:pr is:open author:@me"
          />
        </div>

        {/* New PR Button */}
        <button className="w-full sm:w-auto px-4 sm:px-6 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 whitespace-nowrap order-last sm:order-none">
          New pull request
        </button>
      </div>

      {/* Pull Requests Box */}
      <div className="border border-gray-300 rounded-md bg-white">

        {/* Header */}
        <div className="px-3 sm:px-4 py-3 border-b border-[#d0d7de] bg-gray-50">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 lg:gap-0">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 order-2 lg:order-1 w-full lg:w-auto">
              <button className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-md hover:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 whitespace-nowrap">
                <CheckCircleIcon className="w-3 sm:w-4 h-3 sm:h-4 text-green-600 flex-shrink-0" />
                Open <span className="font-semibold text-gray-900">{openCount}</span>
              </button>
              <button className="flex items-center gap-1 px-2 sm:px-3 py-2 text-xs sm:text-sm text-gray-600 hover:text-gray-900 hover:bg-white rounded-md focus:outline-none whitespace-nowrap">
                Merged <span className="font-semibold">{mergedCount}</span>
              </button>
              <button className="flex items-center gap-1 px-2 sm:px-3 py-2 text-xs sm:text-sm text-gray-600 hover:text-gray-900 hover:bg-white rounded-md focus:outline-none whitespace-nowrap">
                Closed <span className="font-semibold">{closedCount}</span>
              </button>
            </div>
            <div className="flex items-center gap-1 sm:gap-4 text-xs text-gray-600 hidden md:flex order-1 lg:order-2">
              <span>Author</span>
              <span>Label</span>
              <span>Projects</span>
              <span>Reviewers</span>
              <span>Sort</span>
            </div>
          </div>
        </div>

        {/* PR Cards List */}
        {pulls.length > 0 ? (
          pulls.map((pr) => (
            <div
              key={pr.id}
              className="group p-3 sm:p-4 sm:px-5 py-3 sm:py-4 border-b border-gray-100 hover:bg-[#f6f8fa] transition-colors duration-150 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
              tabIndex={0}
            >
              <div className="flex flex-col lg:flex-row items-start lg:items-start gap-3 lg:gap-4">
                {/* Left column - Status + Avatar + Actions (stack mobile) */}
                <div className="flex items-start gap-3 lg:gap-4 w-full lg:w-auto lg:flex-shrink-0">
                  {/* Status indicator */}
                  <div className="flex flex-col mt-1 flex-shrink-0">
                    <div className={`w-2 h-2 rounded-full ${pr.status === 'merged' ? 'bg-green-500' : 'bg-gray-400'}`} />
                    <div className="w-0.5 h-12 bg-gray-200 mt-1" />
                  </div>

                  {/* Avatar */}
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-xs font-semibold text-gray-700 flex-shrink-0 mt-0.5">
                    {pr.avatar}
                  </div>

                  {/* Action buttons - hidden on small screens */}
                  <div className="hidden lg:flex flex-col items-end gap-1 ml-auto">
                    <button 
                      className={`px-3 sm:px-4 py-1.5 text-xs font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-1 whitespace-nowrap ${pr.status === 'open' && !pr.hasConflicts ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 cursor-not-allowed'}`}
                      disabled={pr.hasConflicts || pr.status !== 'open'}
                    >
                      {pr.hasConflicts ? 'Conflicts' : 'Merge pull request'}
                    </button>
                    <button className="px-2 sm:px-3 py-1 text-xs bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-md focus:outline-none whitespace-nowrap">
                      Review
                    </button>
                    <button className="px-2 sm:px-3 py-1 text-xs bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-md focus:outline-none whitespace-nowrap">
                      Dismiss
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {/* PR Title & Number */}
                  <div className="flex items-center gap-2 mb-2">
                    <a href="#" className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 truncate hover:underline focus:outline-none">
                      #{pr.id} {pr.title}
                    </a>
                  </div>

                  {/* Branches */}
                  <div className="flex items-center flex-wrap gap-2 mb-2 text-xs text-gray-600">
                    <CodeBracketIcon className="w-3 h-3 flex-shrink-0" />
                    <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-gray-900 whitespace-nowrap">{pr.base}</span>
                    <span className="text-gray-400 mx-1">←</span>
                    <span className="font-mono bg-green-100 px-1.5 py-0.5 rounded text-green-800 whitespace-nowrap">{pr.head}</span>
                  </div>

                  {/* Author & Date */}
                  <div className="flex items-center flex-wrap gap-2 text-xs text-gray-500 mb-3">
                    <span className="truncate">{pr.author}</span>
                    <span>•</span>
                    <span>{pr.date}</span>
                  </div>

                  {/* Stats - wrap on small screens */}
                  <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <CodeBracketIcon className="w-3 h-3" />
                      {pr.commits} commits
                    </span>
                    <span className="flex items-center gap-1">
                      <ScissorsIcon className="w-3 h-3" />
                      +{pr.files} files
                    </span>
                    <span className="flex items-center gap-1">
                      <ChatBubbleLeftIcon className="w-3 h-3" />
                      {pr.comments} comments
                    </span>
                  </div>

                  {/* Status Badge */}
                  <div className={`inline-flex items-center gap-1 px-2 py-1 mt-2 text-xs font-medium rounded-full border ${pr.status === 'open' ? 'bg-green-100 text-green-800 border-green-200' : pr.status === 'merged' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-gray-100 text-gray-800 border-gray-200'}`}>
                    {pr.status === 'open' && <CheckCircleIcon className="w-3 h-3" />}
                    <span className="capitalize">{pr.status}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-20 px-8">
            <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center text-2xl opacity-40">
              💤
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">This repository currently has no pull requests</h2>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Once pull requests are opened, you'll see a list of them here.
            </p>
            <button className="px-8 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 font-medium">
              Create a pull request
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="text-right mt-4 text-gray-500 underline cursor-pointer">
        Give feedback
      </div>
    </div>
  );
};



/*----------------AgentsPage - GitHub-style AI Agents------------*/
const AgentsPage = () => {
  const [showFilters, setShowFilters] = useState(false);
  const [activeWorkflowsTab, setActiveWorkflowsTab] = useState("all");

  const agents = [
    {
      id: 1,
      name: "Code Reviewer Agent",
      status: "active",
      lastRun: "2 min ago",
      runs: 47,
      repo: "monograph/front-end",
      description: "Reviews PRs for code quality and security issues"
    },
    {
      id: 2,
      name: "Security Scanner",
      status: "failed",
      lastRun: "1 hour ago",
      runs: 23,
      repo: "monograph/api",
      description: "Scans for vulnerabilities and secrets"
    },
    {
      id: 3,
      name: "Documentation Generator",
      status: "active",
      lastRun: "3 hours ago",
      runs: 12,
      repo: "monograph/docs",
      description: "Auto-generates API docs from code"
    }
  ];

  const workflowTabs = ["All workflows", "Active", "Disabled"];

  return (
    <div className="p-4 sm:p-6 bg-[#f6f8fa] min-h-screen text-sm font-sans">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
        {/* Filter/Search Row */}
        <div className="flex flex-col sm:flex-row gap-2 flex-1">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Find agents or workflows..."
              className="w-full pl-10 pr-4 py-2 border border-[#d0d7de] rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>
          <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 whitespace-nowrap">
            New agent
          </button>
        </div>
      </div>

      {/* Agents Box */}
      <div className="border border-[#d0d7de] rounded-md bg-white overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 border-b border-[#d0d7de] bg-gray-50">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Agents &amp; Workflows</h2>
            <div className="flex items-center gap-2 text-sm hidden md:flex">
              <span>All</span>
              <span>✓ Active</span>
              <span>✗ Disabled</span>
            </div>
          </div>
        </div>

        {/* Agents List */}
        {agents.length > 0 ? (
          agents.map((agent) => (
            <div key={agent.id} className="group p-4 border-b border-gray-100 hover:bg-[#f6f8fa] transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500">
              <div className="flex items-start lg:items-center gap-4">
                {/* Status badge */}
                <div className={`flex-shrink-0 px-2 py-1 rounded-full text-xs font-medium ${agent.status === 'active' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'}`}>
                  {agent.status}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                      🤖
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 truncate max-w-xs">{agent.name}</h3>
                      <p className="text-xs text-gray-500">{agent.description}</p>
                    </div>
                  </div>
                  
                  {/* Metadata */}
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <span>📁</span>
                      <span className="truncate">{agent.repo}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <span>⚡</span>
                      {agent.runs} runs
                    </span>
                    <span>{agent.lastRun}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 ml-auto hidden lg:flex">
                  <button className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md focus:outline-none whitespace-nowrap">
                    View logs
                  </button>
                  <button className="px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-md focus:outline-none whitespace-nowrap">
                    Run agent
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-20">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-2xl flex items-center justify-center text-3xl opacity-40">
              🤖
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No agents configured</h3>
            <p className="text-gray-500 mb-8 max-w-sm mx-auto">
              Agents help you automate complex tasks. Add your first agent workflow.
            </p>
            <button className="px-8 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500">
              Create agent workflow
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-8 pt-6 border-t border-gray-200 text-center text-sm text-gray-500">
        Learn more about <a href="#" className="text-blue-600 hover:underline font-medium">GitHub Agents</a>
      </div>
    </div>
  );
};


/*----------------ActionsPage - GitHub Actions------------*/
const ActionsPage = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  const workflows = [
    {
      id: "ci-cd",
      name: "CI/CD Pipeline",
      status: "success",
      lastRun: "2 min ago by you · main",
      branch: "main",
      trigger: "push",
      runs: 156
    },
    {
      id: "lint-test",
      name: "Lint & Test",
      status: "success",
      lastRun: "15 min ago by john-doe · feature/auth",
      branch: "feature/auth",
      trigger: "pull_request",
      runs: 89
    },
    {
      id: "deploy-staging",
      name: "Deploy to Staging",
      status: "failure",
      lastRun: "1 hour ago by jane-smith · develop",
      branch: "develop",
      trigger: "push",
      runs: 23
    },
    {
      id: "security-scan",
      name: "Security Scan",
      status: "queued",
      lastRun: "3 hours ago · main",
      branch: "main",
      trigger: "schedule",
      runs: 12
    }
  ];

  const tabs = ["All workflows", "Active", "Disabled"];
  const statusFilter = ["All statuses", "✅ Success", "❌ Failure", "⏳ In progress", "⏸️ Queued"];

  return (
    <div className="p-4 sm:p-6 bg-[#f6f8fa] min-h-screen text-sm font-sans">
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#d0d7de]">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold text-gray-900">Actions</h1>
          <div className="text-sm text-gray-600">Usage limits: 2000 / 2000 minutes used this month</div>
        </div>
        <button className="px-6 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500">
          Set up custom actions
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        {/* Workflow tabs */}
        <div className="flex border border-gray-200 rounded-md overflow-hidden">
          {tabs.map((tab) => (
            <button
              key={tab}
              className={`px-4 py-2 text-xs font-medium transition-colors ${
                activeTab === tab.toLowerCase().replace(" ", "-")
                  ? "bg-blue-50 border-blue-200 text-blue-700 border-b-2 border-blue-500"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
              onClick={() => setActiveTab(tab.toLowerCase().replace(" ", "-"))}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Status filter dropdown */}
        <div className="relative">
          <select className="px-3 py-2 text-sm border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option>All statuses</option>
            <option>✅ Success</option>
            <option>❌ Failure</option>
          </select>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-gray-500">Showing 1-4 of 4 workflows</span>
        </div>
      </div>

      {/* Workflows List */}
      <div className="space-y-px bg-white border border-gray-200 rounded-md overflow-hidden">
        {workflows.map((workflow) => (
          <div key={workflow.id} className="group hover:bg-gray-50 p-4 border-b border-gray-100 last:border-b-0">
            <div className="flex items-center justify-between">
              {/* Workflow info */}
              <div className="flex items-center gap-4 flex-1">
                {/* Status indicator */}
                <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                  workflow.status === 'success' ? 'bg-green-500' :
                  workflow.status === 'failure' ? 'bg-red-500' :
                  workflow.status === 'queued' ? 'bg-yellow-500' : 'bg-gray-400'
                }`} />
                
                {/* Workflow name */}
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                    {workflow.id.slice(0,2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 truncate">{workflow.name}</h3>
                    <p className="text-xs text-gray-500">{workflow.lastRun}</p>
                  </div>
                </div>

                {/* Branch & Trigger */}
                <div className="hidden md:block text-xs text-gray-500">
                  <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded">{workflow.branch}</span>
                  <span>• {workflow.trigger}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">{workflow.runs} runs</span>
                <button className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md focus:outline-none whitespace-nowrap">
                  Recent
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {workflows.length === 0 && (
        <div className="text-center py-20">
          <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-2xl flex items-center justify-center text-3xl opacity-40">
            ⚙️
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No workflows configured</h3>
          <p className="text-gray-500 mb-8 max-w-sm mx-auto">
            GitHub Actions helps you automate your software development workflows.
          </p>
          <button className="px-8 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500">
            Set up a workflow yourself
          </button>
        </div>
      )}

      {/* Footer */}
      <div className="mt-8 pt-6 border-t border-gray-200 text-sm text-gray-500">
        Learn more about <a href="#" className="text-blue-600 hover:underline font-semibold">GitHub Actions</a>
      </div>
    </div>
  );
};

/*----------------ProjectsPage------------*/
const ProjectsPage = () => {
  return (
    <div className="flex bg-gray-100 min-h-screen">

      {/* Sidebar */}
      <div className="w-64 bg-white border-r p-4">
        <div className="space-y-2">
          <div className="bg-gray-200 p-2 rounded flex items-center gap-2 font-medium">
            📊 Projects
          </div>
          <div className="p-2 text-gray-600 hover:bg-gray-100 rounded cursor-pointer">
            📁 Templates
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">

        {/* Welcome Card */}
        <div className="bg-white border rounded-lg p-6 flex justify-between items-center">
          <div className="max-w-xl">
            <h1 className="text-2xl font-semibold mb-2">
              Welcome to Projects
            </h1>
            <p className="text-gray-600 mb-4">
              Built to be flexible and adaptable, Projects gives you a live canvas
              to filter, sort, and group issues and pull requests in a table,
              board, or roadmap.
            </p>
            <button className="px-4 py-2 border rounded-md hover:bg-gray-100">
              Learn more
            </button>
          </div>

          {/* Right Image Placeholder */}
          <div className="hidden md:block w-64 h-40 bg-gray-200 rounded-lg">
            {/* you can add image here */}
          </div>
        </div>

        {/* Search + Button */}
        <div className="mt-6 flex items-center gap-3">
          <div className="flex items-center flex-1 border rounded-md px-3 py-2 bg-white">
            🔍
            <input
              type="text"
              defaultValue="is:open"
              className="ml-2 w-full outline-none"
            />
          </div>

          <button className="px-4 py-2 border rounded-md bg-white hover:bg-gray-100">
            🔗 Link a project
          </button>
        </div>

        {/* Empty State */}
        <div className="mt-6 bg-white border rounded-lg p-10 text-center">
          <div className="text-3xl mb-3">📦</div>
          <h2 className="text-xl font-semibold mb-2">
            Provide quick access to relevant projects.
          </h2>
          <p className="text-gray-600">
            Add projects from your organization to view them here.
          </p>
        </div>

      </div>
    </div>
  );
};





/*----------------SecurityPage - GitHub Security (Two Disconnected Tables)------------*/
const SecurityPage = () => {
  const securityAlerts = [
    {
      type: "Dependabot",
      severity: "critical",
      title: "Prototype Pollution in lodash",
      package: "lodash",
      version: "4.17.20",
      created: "2 days ago",
      affected: "3 branches"
    },
    {
      type: "Code scanning",
      severity: "high",
      title: "Hard-coded credentials",
      file: "src/auth.js:45",
      created: "1 week ago",
      affected: "main"
    },
    {
      type: "Secret scanning",
      severity: "medium",
      title: "Private key found in commit",
      commit: "abc1234",
      created: "3 days ago",
      affected: "main"
    },
    {
      type: "Dependabot",
      severity: "low",
      title: "Outdated express package",
      package: "express",
      version: "4.18.1 → 4.18.2",
      created: "5 days ago",
      affected: "2 branches"
    }
  ];

  const stats = {
    total: 4,
    critical: 1,
    high: 1,
    medium: 1,
    low: 1
  };

  const getSeverityClass = (severity) => {
    const classes = {
      critical: 'bg-red-100 text-red-800 border-red-200',
      high: 'bg-orange-100 text-orange-800 border-orange-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      low: 'bg-green-100 text-green-800 border-green-200'
    };
    return classes[severity] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const severityList = [
    { label: 'Critical', count: stats.critical },
    { label: 'High', count: stats.high },
    { label: 'Medium', count: stats.medium },
    { label: 'Low', count: stats.low }
  ];

  return (
    <div className="p-6 bg-[#f6f8fa] min-h-screen">
      {/* Main Header */}
      <div className="mb-8 pb-6 border-b border-[#d0d7de]">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Security</h1>
            <p className="text-sm text-gray-600">{stats.total} alerts across all security features</p>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-md border font-medium transition-colors">
              Configure
            </button>
            <button className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors">
              Dismiss all alerts
            </button>
          </div>
        </div>
      </div>

      {/* Two Disconnected Tables - Flex row, no connection */}
      <div className="flex gap-6 lg:flex-row flex-col h-[calc(100vh-200px)] bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        
        {/* LEFT TABLE - Small Stats Table (25%) */}
        <div className="w-full lg:w-72 flex flex-col border-r lg:border-r border-gray-200 lg:border-none">
          <div className="p-6 pb-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Overview</h2>
            <p className="text-sm text-gray-600">Security alerts by severity</p>
          </div>
          
          {/* Stats Table */}
          <div className="flex-1 overflow-auto">
            <table className="w-full">
              <thead className="sticky top-0 bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Severity</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Alerts</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {severityList.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getSeverityClass(item.label.toLowerCase())}`}>
                        {item.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                      {item.count}
                    </td>
                  </tr>
                ))}
                <tr className="bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">Total</td>
                  <td className="px-6 py-4 text-right text-sm font-bold text-gray-900">{stats.total}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Quick Actions */}
          <div className="p-4 pt-0 border-t border-gray-100 bg-gray-50">
            <div className="space-y-2">
              <button className="w-full py-2 px-3 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors">
                Enable all alerts
              </button>
              <button className="w-full py-2 px-3 text-xs bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-md font-medium transition-colors">
                Manage features
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT TABLE - Large Alerts Table (75%) */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="p-6 pb-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Alerts</h2>
              <div className="flex items-center gap-2">
                <div className="flex bg-gray-100 rounded-md overflow-hidden">
                  <button className="px-4 py-2 text-sm font-medium bg-white text-blue-600 border-b-2 border-blue-500">
                    All
                  </button>
                  <button className="px-4 py-2 text-sm text-gray-700 hover:bg-white">Dependabot</button>
                  <button className="px-4 py-2 text-sm text-gray-700 hover:bg-white">Code scanning</button>
                </div>
                <div className="flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-md">
                  <input className="bg-transparent text-sm outline-none w-32" placeholder="Filter..." />
                </div>
              </div>
            </div>
          </div>

          {/* Alerts Table */}
          <div className="flex-1 overflow-auto">
            <table className="w-full divide-y divide-gray-200">
              <thead className="sticky top-0 bg-white border-b border-gray-200 z-10">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">Severity</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider flex-1 min-w-0">Title</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">Package/File</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-24">Created</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-20">Affected</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {securityAlerts.map((alert, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-blue-100 text-blue-800 font-medium">
                        {alert.type}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium border ${getSeverityClass(alert.severity)}`}>
                        {alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm font-medium text-gray-900 group-hover:text-blue-600 truncate max-w-none">
                        {alert.title}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {alert.package ? (
                        <span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-xs">
                          {alert.package} {alert.version}
                        </span>
                      ) : alert.file ? (
                        <span className="font-mono text-xs">{alert.file}</span>
                      ) : (
                        <span className="font-mono text-xs">{alert.commit}</span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-right text-sm text-gray-900 whitespace-nowrap">
                      {alert.created}
                    </td>
                    <td className="px-4 py-4 text-right text-sm font-medium text-gray-900 whitespace-nowrap">
                      {alert.affected}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};


/*----------------SettingsPage------------*/
import { Cog6ToothIcon } from "@heroicons/react/24/outline";

const SettingsPage = () => {
    return (
        <div className="flex gap-6 p-6">

          <div className="w-1/3 bg-white rounded-lg p-4">
               <p className="text-gray-400 mb-2">Security</p>
              <div className="flex items-center gap-2 text-gray-500">
               <Cog6ToothIcon className="w-5 h-5" />
              <p className="font-semibold">Secrets and variables</p>
              </div>
             </div>

            {/* RIGHT TABLE */}
            <div className="w-2/3 bg-white rounded-lg p-4">
                <h2 className="text-lg font-bold">Features</h2>

                <hr className="my-3 border-gray-300" />

                <h3 className="text-gray-700">
                    You don't have any repository
                </h3>

                <p className="text-gray-500">
                    Check the sidebar for available settings
                </p>
            </div>

        </div>
    );
};
