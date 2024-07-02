import base64
import json
import time
from io import BytesIO
from typing import List

from selenium import webdriver
from selenium.webdriver.chrome.options import Options as ChromeOptions
from selenium.webdriver.chrome.service import Service as ChromeService
from webdriver_manager.chrome import ChromeDriverManager

class PdfGenerator:
    print_options = {
        'landscape': False,
        'displayHeaderFooter': False,
        'printBackground': True,
        'preferCSSPageSize': True,
        'paperWidth': 6.97,
        'paperHeight': 16.5,
    }

    def __init__(self, urls: List[str]):
        self.urls = urls

    def _get_pdf_from_url(self, url, *args, **kwargs):
        chrome_options = ChromeOptions()
        chrome_options.add_argument('--headless')
        chrome_options.add_argument('--disable-gpu')
        
        with webdriver.Chrome(
            service=ChromeService(ChromeDriverManager().install()), 
            options=chrome_options
        ) as driver:
        # with webdriver.Chrome(options=chrome_options) as driver:
            driver.get(url)
            time.sleep(1)  # allow the page to load, increase if needed
            print_options = self.print_options.copy()
            result = self._send_devtools(driver, "Page.printToPDF", print_options)
            return base64.b64decode(result['data'])

    @staticmethod
    def _send_devtools(driver, cmd, params):
        resource = "/session/%s/chromium/send_command_and_get_result" % driver.session_id
        url = driver.command_executor._url + resource
        body = json.dumps({'cmd': cmd, 'params': params})
        response = driver.command_executor._request('POST', url, body)
        return response.get('value')

    def _generate_pdfs(self):
        pdf_files = []

        for url in self.urls:
            result = self._get_pdf_from_url(url)
            file = BytesIO()
            file.write(result)
            pdf_files.append(file)

        return pdf_files

    def main(self) -> List[BytesIO]:
        return self._generate_pdfs()



# import base64
# import json
# import time
# from io import BytesIO
# from typing import List

# from selenium import webdriver
# from selenium.webdriver.chrome.options import Options as ChromeOptions
# from selenium.webdriver.chrome.service import Service


# class PdfGenerator:
#     """
#      Simple use case:
#         pdf_file = PdfGenerator(['https://google.com']).main()
#         with open('new_pdf.pdf', "wb") as outfile:
#             outfile.write(pdf_file[0].getbuffer())
#     """
#     driver = None
#     # https://chromedevtools.github.io/devtools-protocol/tot/Page#method-printToPDF
#     print_options = {
#         'landscape': False,
#         'displayHeaderFooter': False,
#         'printBackground': True,
#         'preferCSSPageSize': True,
#         'paperWidth': 6.97,
#         'paperHeight': 16.5,
#     }

#     def __init__(self, urls: List[str]):
#         self.urls = urls

#     def _get_pdf_from_url(self, url, *args, **kwargs):
#         self.driver.get(url)

#         time.sleep(1)  # allow the page to load, increase if needed

#         print_options = self.print_options.copy()
#         result = self._send_devtools(self.driver, "Page.printToPDF", print_options)
#         return base64.b64decode(result['data'])

#     @staticmethod
#     def _send_devtools(driver, cmd, params):
#         """
#         Works only with chromedriver.
#         Method uses cromedriver's api to pass various commands to it.
#         """
#         resource = "/session/%s/chromium/send_command_and_get_result" % driver.session_id
#         url = driver.command_executor._url + resource
#         body = json.dumps({'cmd': cmd, 'params': params})
#         response = driver.command_executor._request('POST', url, body)
#         return response.get('value')

#     def _generate_pdfs(self):
#         pdf_files = []

#         for url in self.urls:
#             result = self._get_pdf_from_url(url)
#             file = BytesIO()
#             file.write(result)
#             pdf_files.append(file)

#         return pdf_files

#     def main(self) -> List[BytesIO]:
#         webdriver_options = ChromeOptions()
#         webdriver_options.add_argument('--headless')
#         webdriver_options.add_argument('--disable-gpu')

#         try:
#           self.driver = webdriver.Chrome(
#             service=Service(),
#             options=webdriver_options  # Corrected variable name
#           )
#           result = self._generate_pdfs()
#         finally:
#           self.driver.close()

#         return result