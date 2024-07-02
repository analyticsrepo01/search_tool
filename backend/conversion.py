# https://pypi.org/project/pdfkit/
import pdfkit
import requests


def convert_url_to_pdf(url):
    try:
        options = {
            'quiet': '',
            'no-background': None,
            'print-media-type': None
        }
        pdf_content = pdfkit.from_url(url, False, options=options)
        print("Webpage converted to PDF.")
        return pdf_content
    except Exception as e:
        print(f"Error occurred: {str(e)}")
        return None


def convert_url_to_html(url):
    try:
        response = requests.get(url)
        html_content = response.text
        print("Webpage converted to HTML.")
        print(html_content)
        return html_content
    except Exception as e:
        print(f"Error occurred: {str(e)}")
        return None


####################################################################################################
"""Run and Save as variables"""

# url = "https://python.langchain.com/docs/integrations/retrievers/google_cloud_enterprise_search"

# pdf_content = convert_url_to_pdf(url)

# html_content = convert_url_to_html(url)

####################################################################################################
"""Run and Save in Directory"""

# url = "https://www.cpf.gov.sg/employer/faq/employer-obligations/how-much-cpf-contributions-to-pay/what-are-the-changes-to-rates-for-senior-workers-from-1-jan-2024"

# pdfkit.from_file(url, 'example.pdf')

# html_content = convert_url_to_html(url)
# if html_content:
#     with open("example.html", "w", encoding="utf-8") as file:
#         file.write(html_content)
#     print("Webpage converted to HTML: example.html")
