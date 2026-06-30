async function loadData() {
  try {
    const res = await fetch('./data/ue5-knowledge-base.json');
    if (!res.ok) throw new Error('Failed to load data');
    const data = await res.json();
    return data.repositories;
  } catch (err) {
    console.error('Error loading data:', err);
    document.getElementById('repoList').innerHTML = '<p style="color: red;">Error loading data</p>';
    return [];
  }
}

function uniq(values) {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b));
}

function fillSelect(select, values) {
  values.forEach(v => {
    const opt = document.createElement('option');
    opt.value = v;
    opt.textContent = v;
    select.appendChild(opt);
  });
}

function card(repo) {
  const topicTags = repo.topics.map(t => `<span class="tag topic">${t}</span>`).join('');
  const searchTags = repo.search_tags.map(t => `<span class="tag search">${t}</span>`).join('');

  return `
    <article class="card">
      <h2><a href="${repo.url}" target="_blank" rel="noopener noreferrer">${repo.owner}/${repo.repo}</a></h2>
      <div class="meta">
        <span class="meta-badge">${repo.type}</span>
        <span class="meta-badge">${repo.format}</span>
        <span class="meta-badge">${repo.difficulty}</span>
        <span class="meta-badge">UE: ${repo.ue_versions.join(', ')}</span>
      </div>
      <p class="summary">${repo.summary}</p>
      <p class="audience"><strong>Audience:</strong> ${repo.audience.join(', ')}</p>
      <p class="why-useful"><strong>Key benefits:</strong> ${repo.why_useful.join(' • ')}</p>
      <div class="tags">
        ${topicTags}
        ${searchTags}
      </div>
    </article>
  `;
}

function matches(repo, query, difficulty, format, topic) {
  const haystack = [
    repo.name,
    repo.owner,
    repo.repo,
    repo.type,
    repo.format,
    repo.summary,
    ...repo.topics,
    ...repo.search_tags,
    ...repo.audience,
    ...repo.ue_versions
  ].join(' ').toLowerCase();

  const queryOk = !query || haystack.includes(query.toLowerCase());
  const difficultyOk = !difficulty || repo.difficulty === difficulty;
  const formatOk = !format || repo.format === format;
  const topicOk = !topic || repo.topics.includes(topic);

  return queryOk && difficultyOk && formatOk && topicOk;
}

function render(repos) {
  const search = document.getElementById('search').value.trim();
  const difficulty = document.getElementById('difficultyFilter').value;
  const format = document.getElementById('formatFilter').value;
  const topic = document.getElementById('topicFilter').value;

  const filtered = repos.filter(r => matches(r, search, difficulty, format, topic));

  const count = filtered.length;
  const total = repos.length;
  document.getElementById('stats').textContent =
    count === total
      ? `${count} repositories`
      : `${count} of ${total} repositories`;

  document.getElementById('repoList').innerHTML =
    filtered.length > 0
      ? filtered.map(card).join('')
      : '<p style="color: #94a3b8; text-align: center; padding: 2rem;">No repositories match your filters.</p>';
}

loadData().then(repos => {
  if (!repos || repos.length === 0) return;

  fillSelect(document.getElementById('difficultyFilter'), uniq(repos.map(r => r.difficulty)));
  fillSelect(document.getElementById('formatFilter'), uniq(repos.map(r => r.format)));
  fillSelect(document.getElementById('topicFilter'), uniq(repos.flatMap(r => r.topics)));

  ['search', 'difficultyFilter', 'formatFilter', 'topicFilter'].forEach(id => {
    const element = document.getElementById(id);
    element.addEventListener('input', () => render(repos));
    element.addEventListener('change', () => render(repos));
  });

  render(repos);
});
