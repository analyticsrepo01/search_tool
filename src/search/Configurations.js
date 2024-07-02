const Configurations = ({ pageSize, setPageSize, summaryCount, setSummaryCount, numSnippets, setNumSnippets, numAnswers, setNumAnswers, numSegments, setNumSegments, tenant, setTenant, tenantList}) => {
    return (
        <div className="filter-card mb-3 py-4 shadow">
            <h3 className="filter-title">Configurations</h3>
            <hr className="divider" />
            <div>
                <div>
                    <h5 className="sub-title"># of Results per Page</h5>
                    <select
                        className="form-select"
                        value={pageSize}
                        onChange={(e) => setPageSize(parseInt(e.target.value))}
                    >
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                        <option value="6">6</option>
                        <option value="7">7</option>
                        <option value="8">8</option>
                        <option value="9">9</option>
                        <option value="10">10</option>
                    </select>

                    {/* <div style={{ display: 'none' }}> */}
                    <div>
                        <h5 className="sub-title"># of Snippets per Result</h5>
                        <select
                            className="form-select"
                            value={numSnippets}
                            onChange={(e) => setNumSnippets(parseInt(e.target.value))}
                        >
                            <option value="0">0</option>
                            <option value="1">1</option>
                            {/* <option value="2">2</option>
                            <option value="3">3</option>
                            <option value="4">4</option>
                            <option value="5">5</option> */}
                        </select>
                    </div>

                    <div>
                        <h5 className="sub-title"># of Extractive Answers per Result</h5>
                        <select
                            className="form-select"
                            value={numAnswers}
                            onChange={(e) => setNumAnswers(parseInt(e.target.value))}
                        >
                            <option value="0">0</option>
                            <option value="1">1</option>
                            <option value="2">2</option>
                            <option value="3">3</option>
                            <option value="4">4</option>
                            <option value="5">5</option>
                        </select>
                    </div>

                    <div>
                        <h5 className="sub-title"># of Extractive Segments per Result</h5>
                        <select
                            className="form-select"
                            value={numSegments}
                            onChange={(e) => setNumSegments(parseInt(e.target.value))}
                        >
                            <option value="0">0</option>
                            <option value="1">1</option>
                            <option value="2">2</option>
                            <option value="3">3</option>
                            <option value="4">4</option>
                            <option value="5">5</option>
                            <option value="6">6</option>
                            <option value="7">7</option>
                            <option value="8">8</option>
                            <option value="9">9</option>
                            <option value="10">10</option>
                        </select>
                    </div>

                </div>
                <h5 className="sub-title"># of Top Results to use for Summary</h5>
                <select
                    className="form-select"
                    value={summaryCount}
                    onChange={(e) => setSummaryCount(parseInt(e.target.value))}
                >
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                </select>
            </div>

            <div style={{ display: 'none' }}>
                <h5 className="sub-title">Tenant</h5>
                <select
                    className="form-select"
                    value={tenant}
                    onChange={(e) => setTenant(e.target.value)}
                >
                <option value="">All</option>
                {tenantList.map((i, index) => (
                    <option key={index} value={i}>{i}</option>
                ))}
                </select>
            </div>
        </div>
    );
};

export default Configurations;