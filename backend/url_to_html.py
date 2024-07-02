import requests


def fetch_url_content(url):
    try:
        response = requests.get(url)
        response.raise_for_status()
        return response.text

    except requests.exceptions.RequestException as e:
        print(f"Failed to fetch the webpage: {e}")
        return None
    except Exception as e:
        print(f"An error occurred: {e}")
        return None


def save_html_to_file(html_content, output_filename):
    try:
        with open(output_filename, "w", encoding="utf-8") as f:
            f.write(html_content)

        print(f"Webpage content saved to file: {output_filename}")
        print(html_content)

    except Exception as e:
        print(f"Failed to save HTML content to file: {e}")


# # Example usage
# # url = "https://www.cloudflare.com/learning/dns/dns-server-types/"
# url = "https://cloud.google.com/blog/topics/google-cloud-next/early-bird-registration-open-for-google-cloud-next-2023"
# output_filename = "url_to_html.html"

# html_content = fetch_url_content(url)

# # Save the HTML content to a file
# if html_content is not None:
#     save_html_to_file(html_content, output_filename)
