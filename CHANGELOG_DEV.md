# CHANGELOG_DEV.md

## 1.5.3 (30 Oct 2023)
### Bug fixes
- Fix Import using CSV and JSON -> Current Commit

## 1.5.2 (19 Oct 2023)
### Features
- Added {{summary}} in prompt editor -> [3370466](https://github.com/gitteroy/cymbalsearch/commit/3370466370854ee58a1537e6be1532b612ecb1ad)
- Removed hardcoded engine list and model list; feed them in as Environment Variables instead -> [3370466](https://github.com/gitteroy/cymbalsearch/commit/3370466370854ee58a1537e6be1532b612ecb1ad)
### Bug fixes
- Dockerfile to build React frontend within image -> [3370466](https://github.com/gitteroy/cymbalsearch/commit/3370466370854ee58a1537e6be1532b612ecb1ad)
- Fixed Import webpage using HTML -> [3370466](https://github.com/gitteroy/cymbalsearch/commit/3370466370854ee58a1537e6be1532b612ecb1ad)
- Removed using of Service Account JSON keys for reading GCS docs - /read returns byte64 content -> [3370466](https://github.com/gitteroy/cymbalsearch/commit/3370466370854ee58a1537e6be1532b612ecb1ad)
- Fixed DOMException error when parsing segments with "<>" but it not a DOM -> [3370466](https://github.com/gitteroy/cymbalsearch/commit/3370466370854ee58a1537e6be1532b612ecb1ad)
- Fixed URL Query parsing engine_id -> Current Commit

## 1.5.1 (16 Oct 2023)
### Features
- Reusable Query URL string -> [d3e3a6f](https://github.com/gitteroy/cymbalsearch/commit/d3e3a6fddfd479325b02b8785089b3ab761bc131)
### Bug fixes
- Removed resusable string from header -> [d3e3a6f](https://github.com/gitteroy/cymbalsearch/commit/d3e3a6fddfd479325b02b8785089b3ab761bc131)
- Added link to CSV template at Bulk Import using CSV -> [d3e3a6f](https://github.com/gitteroy/cymbalsearch/commit/d3e3a6fddfd479325b02b8785089b3ab761bc131)

## 1.5.0 (13 Oct 2023)
### Features
- Bulk import using CSV -> [999595f](https://github.com/gitteroy/cymbalsearch/commit/999595f3ca82c727b55b65be0e33846a1398d6ae)
- Bulk import by using public GCS and fill up metadata table -> [999595f](https://github.com/gitteroy/cymbalsearch/commit/999595f3ca82c727b55b65be0e33846a1398d6ae)
### Bug fixes
- Fixed preview of non-PDF documents -> [999595f](https://github.com/gitteroy/cymbalsearch/commit/999595f3ca82c727b55b65be0e33846a1398d6ae)
- Only Search Page should see the Reusable String input box at Header -> [999595f](https://github.com/gitteroy/cymbalsearch/commit/999595f3ca82c727b55b65be0e33846a1398d6ae)

## 1.4.0 (11 Oct 2023)
### Features
- Use React PDF Viewer for all PDF previews -> [1b621ec](https://github.com/gitteroy/cymbalsearch/commit/1b621ecf8571d6af5414201524c3b90ad30b25fc)
- Reusable Query String -> [1b621ec](https://github.com/gitteroy/cymbalsearch/commit/1b621ecf8571d6af5414201524c3b90ad30b25fc)
### Bug fixes
- Num of Snippet configuration did not process backend -> [1b621ec](https://github.com/gitteroy/cymbalsearch/commit/1b621ecf8571d6af5414201524c3b90ad30b25fc)
- Hide extractive answers / segments if none of them returned in results -> [1b621ec](https://github.com/gitteroy/cymbalsearch/commit/1b621ecf8571d6af5414201524c3b90ad30b25fc)

## 1.3.1 (9 Oct 2023)
### Features
- User able to delete conversation(s) from Multi-turn conversations list -> [e313c4b](https://github.com/gitteroy/cymbalsearch/commit/e313c4b79c535c68c71be5034fa1ef3ccc138646)
- At import docs, user able to select if they want to summarise document -> [192c689](https://github.com/gitteroy/cymbalsearch/commit/192c689dcaacc0a4bfe40eef76646f8f218e0ebc)
### Bug fixes
- Fix segment pdf preview -> [192c689](https://github.com/gitteroy/cymbalsearch/commit/192c689dcaacc0a4bfe40eef76646f8f218e0ebc)

## 1.3.0 (2 Oct 2023)
### Features
- PDF highlighter for extractive answer PDF view -> [a0910dc](https://github.com/gitteroy/cymbalsearch/commit/a0910dcc91655b6e3a87d3eb6983e017dd101acf)

## 1.2.2 (28 Sep 2023)
### Features
- DocAI Summarizer adds summary_brief and summary_comprehensive for docs of <250 pages during Import Document function -> [de841f5](https://github.com/gitteroy/cymbalsearch/commit/de841f511dbb5aba18f85e8b68f57ca9d1670942)
- Data Page Sidebar hide/unhide button at bottom left of screen -> [de841f5](https://github.com/gitteroy/cymbalsearch/commit/de841f511dbb5aba18f85e8b68f57ca9d1670942)
- Email function working at Footer and Contact -> [de841f5](https://github.com/gitteroy/cymbalsearch/commit/de841f511dbb5aba18f85e8b68f57ca9d1670942)
- Allow user to choose model for initial query -> [de841f5](https://github.com/gitteroy/cymbalsearch/commit/de841f511dbb5aba18f85e8b68f57ca9d1670942)
- Vertex AI Summary config for temp, topK, topP -> [0142aa2](https://github.com/gitteroy/cymbalsearch/commit/0142aa287c2084dfb55c66d161167bb19dc4066b)

## 1.2.1 (22 Sep 2023)
### Features
- Summarizer will create Summary for doc during Import Document and add as Summary metadata  -> [1677a03](https://github.com/gitteroy/cymbalsearch/commit/1677a0378ea84b7bc8fc17e296a9a87262864b9b)

## 1.1.1 (13 Sep 2023)
### Features
- At Summary Section can toggle between HTML and Markdown display -> [f6fd530](https://github.com/gitteroy/cymbalsearch/commit/f6fd530b0fb993133c9e5f00b74018d7952b028d)
- At Chatbot Page displays List of Conversations below the chatbot -> [99edea0](https://github.com/gitteroy/cymbalsearch/commit/99edea0894a6e5cba3e34181a3e2440f991b442f)
- At Chatbot Page, user can click a specific conversation link to open it and continue the conversation -> [99edea0](https://github.com/gitteroy/cymbalsearch/commit/99edea0894a6e5cba3e34181a3e2440f991b442f)

## 1.1.0 (8 Sep 2023)
### Features
- Chatbot Page accessible via header menu -> [f124077](https://github.com/gitteroy/cymbalsearch/commit/f1240776f0c1ebeded75e63d9be3e9343c646850)
- Follow-up question by clicking chat icon on bottom right of your Search page -> [f124077](https://github.com/gitteroy/cymbalsearch/commit/f1240776f0c1ebeded75e63d9be3e9343c646850)
### Bug fixes
- Render HTML in conversation replies 
- Fixed Reference results alignment 
- Use "Follow-up" and "Multi-turn Search", not "Chatbot" 
- Auto Focus on search input of chatbot to allow user to engage in convo smoothly -> [ad66b01](https://github.com/gitteroy/cymbalsearch/commit/ad66b01c8199ff7405b30f31274030615ae173b3)
- Fixed Chatbot page unable to start new convo -> [31d35db](https://github.com/gitteroy/cymbalsearch/commit/31d35db80b5b3501d2d15527041cded6487e3e1b)
- Fixed PCA engine id in config.js -> [31d35db](https://github.com/gitteroy/cymbalsearch/commit/31d35db80b5b3501d2d15527041cded6487e3e1b)
- Fixed minor UI alignment in Follow-up pop-up -> [31d35db](https://github.com/gitteroy/cymbalsearch/commit/31d35db80b5b3501d2d15527041cded6487e3e1b)


## 1.0.0 (3 Sep 2023)
### Features
- Added CHANGELOG_MAIN.md and CHANGELOG_DEV.md to updates -> [145c3a9](https://github.com/gitteroy/cymbalsearch/commit/145c3a9800144bc4590fb86dd895c8600b622085)
- Toggle Hide/Unhide Segments at Pop-up -> [145c3a9](https://github.com/gitteroy/cymbalsearch/commit/145c3a9800144bc4590fb86dd895c8600b622085)
### Bug fixes
- Adjust width of PDF preview to fit screen and height to 1000px -> [145c3a9](https://github.com/gitteroy/cymbalsearch/commit/145c3a9800144bc4590fb86dd895c8600b622085)