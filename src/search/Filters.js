const Filters = ({ tenant, setTenant, tenantList}) => {
    return (
        <div className="filter-card mb-3 py-4 shadow">
            <h3 className="filter-title">Filters</h3>
            <hr className="divider" />
            <div>
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
            <div hidden={true}>
                <h5 className="sub-title">Category</h5>
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

export default Filters;