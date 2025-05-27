function Summary({ summary, users }) {
  const getName = (id) => users.find(u => u.id === id)?.name || id;

  return (
    <>
      <h3>Summary</h3>
      <ul>
        {summary.map((s, i) => (
          <li key={i}>
            {getName(s.from)} owes {getName(s.to)} ${Number(s.amount).toFixed(2)}
          </li>
        ))}
      </ul>
    </>
  );
}

export default Summary;
