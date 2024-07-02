let localhost;
if (process.env.NODE_ENV === "development") {
    localhost = "http://localhost:8000";
} else {
    localhost = "";
}

const config = {
    LOCALHOST: localhost,
};

export default config;
