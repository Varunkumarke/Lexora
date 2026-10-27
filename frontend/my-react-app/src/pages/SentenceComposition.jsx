import { useState, useEffect, useRef } from "react";
import "./SentenceComposition.css"; 

const VIDEOS = {
  M1: "https://res.cloudinary.com/dpvt8qcs8/video/upload/v1772613708/20260304_1300_New_Video_simple_compose_01kjvw23d4e068hsjd6njqwqv9_f7fza9.mp4",
  M2: "https://www.w3schools.com/html/mov_bbb.mp4",
  M3: "https://res.cloudinary.com/dpvt8qcs8/video/upload/v1772619261/20260304_1541_New_Video_simple_compose_01kjw59bk6e7aaq6v0jn59tcye_v2yyom.mp4",
  B1: "https://res.cloudinary.com/dpvt8qcs8/video/upload/v1772616535/20260304_1456_New_Video_simple_compose_01kjw2qwnpfkf8c7mdxkm41t8s_jni6gs.mp4",
  B2: "https://res.cloudinary.com/dpvt8qcs8/video/upload/v1772616249/20260304_1449_New_Video_simple_compose_01kjw2ak9jf4684cyg26nghewc_dff89o.mp4",
  D1: "https://res.cloudinary.com/dpvt8qcs8/video/upload/v1772614019/20260227_1646_New_Video_simple_compose_01kjfd0q9bfcxrkk83r0w1tgan_nuwzfs.mp4",
  D2: "https://res.cloudinary.com/dpvt8qcs8/video/upload/v1772617001/20260304_1429_New_Video_simple_compose_01kjw14zz5fdsbqkq9shzfgr7q_ipaxcc.mp4",
  BB: "https://www.w3schools.com/html/mov_bbb.mp4",
};

const UNLOCK_THRESHOLDS = [0, 0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36, 38, 40, 42];

const DOMAINS = [
  { id:"medical", label:"Medical", icon:"⚕", description:"Clinical vocabulary & patient communication", color:"#0f766e", bg:"#f0fdfa", border:"#99f6e4",
    sentences:[
      { id:"m1", mediaType:"video", sentence:"the doctor checks the patient's pulse",
        coreWords:["The","doctor","checks","the","patient's","pulse"],
        extraWords:["examines","nurse","wrist"],
        acceptedSentences:[
          "The doctor checks the patient's pulse",
          "The doctor checks the patient's wrist", 
          "The doctor examines the patient's pulse", 
          "The doctor examines the patient's wrist",
          "The nurse checks the patient's pulse",
          "The nurse checks the patient's wrist",
          "The nurse examines the patient's pulse",
          "The nurse examines the patient's wrist",
        ],
        videoUrl:VIDEOS.M1, imageUrl:"https://images.pexels.com/photos/7089033/pexels-photo-7089033.jpeg?auto=compress&cs=tinysrgb&w=800", poster:"https://images.pexels.com/photos/7089033/pexels-photo-7089033.jpeg?auto=compress&cs=tinysrgb&w=800", note:"A doctor physically checks the pulse at the wrist — a visible, everyday clinical action." },

      { id:"m2", mediaType:"video", sentence:"the nurse gives the patient an injection",
        coreWords:["The","nurse","gives","the","patient","an","injection"],
        extraWords:["administers","doctor","shot"],
        acceptedSentences:[
          "The nurse gives the patient an injection",
          "The nurse gives the patient a shot",
          "The nurse administers the patient an injection",
          "The nurse administers the patient a shot",
          "The doctor gives the patient an injection",
          "The doctor gives the patient a shot",
          "The doctor administers the patient an injection",
          "The doctor administers the patient a shot",
        ],
        videoUrl:VIDEOS.M2, imageUrl:"https://images.pexels.com/photos/7659554/pexels-photo-7659554.jpeg?auto=compress&cs=tinysrgb&w=800", poster:"https://images.pexels.com/photos/7659554/pexels-photo-7659554.jpeg?auto=compress&cs=tinysrgb&w=800", note:"Administering an injection — use 'an' because 'injection' starts with a vowel." },

      { id:"m3", mediaType:"image", sentence:"the doctor is listening to the patient's chest",
        coreWords:["The","doctor","is","listening","to","the","patient's","chest"],
        extraWords:["nurse","examining","back"],
        acceptedSentences:[
          "The doctor is listening to the patient's chest",
          "The doctor is listening to the patient's back",
          "The doctor is examining the patient's chest",
          "The doctor is examining the patient's back",
          "The nurse is listening to the patient's chest",
          "The nurse is listening to the patient's back",
          "The nurse is examining the patient's chest",
          "The nurse is examining the patient's back",
        ],
        videoUrl:VIDEOS.M3, imageUrl:"https://images.pexels.com/photos/8376277/pexels-photo-8376277.jpeg?auto=compress&cs=tinysrgb&w=800", poster:"https://images.pexels.com/photos/8376277/pexels-photo-8376277.jpeg?auto=compress&cs=tinysrgb&w=800", note:"Doctors use a stethoscope to listen to the heart and lungs." },

      { id:"m4", mediaType:"image", sentence:"the nurse is taking the patient's blood pressure",
        coreWords:["The","nurse","is","taking","the","patient's","blood","pressure"],
        extraWords:["doctor","checking","temperature"],
        acceptedSentences:[
          "The nurse is taking the patient's blood pressure",
          "The nurse is taking the patient's temperature",
          "The nurse is checking the patient's blood pressure",
          "The nurse is checking the patient's temperature",
          "The doctor is taking the patient's blood pressure",
          "The doctor is taking the patient's temperature",
          "The doctor is checking the patient's blood pressure",
          "The doctor is checking the patient's temperature",
        ],
        videoUrl:VIDEOS.M3, imageUrl:"https://images.pexels.com/photos/7108318/pexels-photo-7108318.jpeg?auto=compress&cs=tinysrgb&w=800", poster:"https://images.pexels.com/photos/7108318/pexels-photo-7108318.jpeg?auto=compress&cs=tinysrgb&w=800", note:"Taking blood pressure is a routine check done at almost every appointment." },

      { id:"m5", mediaType:"image", sentence:"the pills are on the table",
        coreWords:["The","pills","are","on","the","table"],
        extraWords:["tablets","beside","desk"],
        acceptedSentences:[
          "The pills are on the table",
          "The pills are on the desk",
          "The pills are beside the table",
          "The pills are beside the desk",
          "The tablets are on the table",
          "The tablets are on the desk",
          "The tablets are beside the table",
          "The tablets are beside the desk",
        ],
        videoUrl:VIDEOS.M3, imageUrl:"https://images.pexels.com/photos/139398/thermometer-headache-pain-pills-139398.jpeg?auto=compress&cs=tinysrgb&w=800", poster:"https://images.pexels.com/photos/139398/thermometer-headache-pain-pills-139398.jpeg?auto=compress&cs=tinysrgb&w=800", note:"Pills and tablets are the most common form of oral medicine." },
    ]},

  { id:"legal", label:"Legal", icon:"⚖", description:"Courtroom language & contract terminology", color:"#92400e", bg:"#fffbeb", border:"#fde68a",
    sentences:[
      { id:"l1", mediaType:"video", sentence:"the person signs a document on the desk",
        coreWords:["The","person","signs","a","document","on","the","desk"],
        extraWords:["lawyer","contract","table"],
        acceptedSentences:[
          "The person signs a document on the desk",
          "The person signs a document on the table",
          "The person signs a contract on the desk",
          "The person signs a contract on the table",
          "The lawyer signs a document on the desk",
          "The lawyer signs a document on the table",
          "The lawyer signs a contract on the desk",
          "The lawyer signs a contract on the table",
        ],
        videoUrl:VIDEOS.BB, imageUrl:"https://images.pexels.com/photos/7841790/pexels-photo-7841790.jpeg?auto=compress&cs=tinysrgb&w=800", poster:"https://images.pexels.com/photos/7841790/pexels-photo-7841790.jpeg?auto=compress&cs=tinysrgb&w=800", note:"Signing a document is a universally recognisable legal action." },

      { id:"l2", mediaType:"video", sentence:"the lawyer hands a folder to the client",
        coreWords:["The","lawyer","hands","a","folder","to","the","client"],
        extraWords:["passes","document","person"],
        acceptedSentences:[
          "The lawyer hands a folder to the client",
          "The lawyer hands a folder to the person",
          "The lawyer hands a document to the client",
          "The lawyer hands a document to the person",
          "The lawyer passes a folder to the client",
          "The lawyer passes a folder to the person",
          "The lawyer passes a document to the client",
          "The lawyer passes a document to the person",
        ],
        videoUrl:VIDEOS.BB, imageUrl:"https://images.pexels.com/photos/6077132/pexels-photo-6077132.jpeg?auto=compress&cs=tinysrgb&w=800", poster:"https://images.pexels.com/photos/6077132/pexels-photo-6077132.jpeg?auto=compress&cs=tinysrgb&w=800", note:"Passing documents between parties is a core legal interaction." },

      { id:"l3", mediaType:"image", sentence:"the gavel is on the desk",
        coreWords:["The","gavel","is","on","the","desk"],
        extraWords:["hammer","under","table"],
        acceptedSentences:[
          "The gavel is on the desk",
          "The gavel is on the table",
          "The gavel is under the desk",
          "The gavel is under the table",
          "The hammer is on the desk",
          "The hammer is on the table",
          "The hammer is under the desk",
          "The hammer is under the table",
        ],
        videoUrl:VIDEOS.BB, imageUrl:"https://images.pexels.com/photos/5816698/pexels-photo-5816698.jpeg?auto=compress&cs=tinysrgb&w=800", poster:"https://images.pexels.com/photos/5816698/pexels-photo-5816698.jpeg?auto=compress&cs=tinysrgb&w=800", note:"A judge strikes the gavel to call order in court." },

      { id:"l4", mediaType:"image", sentence:"the two lawyers are shaking hands",
        coreWords:["The","two","lawyers","are","shaking","hands"],
        extraWords:["judges","greeting","holding"],
        acceptedSentences:[
          "The two lawyers are shaking hands",
          "The two lawyers are greeting each other",
          "The two lawyers are holding hands",
          "The two judges are shaking hands",
          "The two judges are greeting each other",
          "The two judges are holding hands",
        ],
        videoUrl:VIDEOS.BB, imageUrl:"https://images.pexels.com/photos/8112199/pexels-photo-8112199.jpeg?auto=compress&cs=tinysrgb&w=800", poster:"https://images.pexels.com/photos/8112199/pexels-photo-8112199.jpeg?auto=compress&cs=tinysrgb&w=800", note:"A handshake signals the end of negotiations." },

      { id:"l5", mediaType:"image", sentence:"the law books are on the shelf",
        coreWords:["The","law","books","are","on","the","shelf"],
        extraWords:["folders","under","table"],
        acceptedSentences:[
          "The law books are on the shelf",
          "The law books are on the table",
          "The law books are under the shelf",
          "The law books are under the table",
          "The folders are on the shelf",
          "The folders are on the table",
          "The folders are under the shelf",
          "The folders are under the table",
        ],
        videoUrl:VIDEOS.BB, imageUrl:"https://images.pexels.com/photos/5668779/pexels-photo-5668779.jpeg?auto=compress&cs=tinysrgb&w=800", poster:"https://images.pexels.com/photos/5668779/pexels-photo-5668779.jpeg?auto=compress&cs=tinysrgb&w=800", note:"Law books contain every rule and case used in court." },
    ]},

  { id:"tech", label:"Technology", icon:"⌨", description:"Engineering workflows & system architecture", color:"#1d4ed8", bg:"#eff6ff", border:"#bfdbfe",
    sentences:[
      { id:"t1", mediaType:"video", sentence:"the developer types code on a laptop",
        coreWords:["The","developer","types","code","on","a","laptop"],
        extraWords:["writes","engineer","computer"],
        acceptedSentences:[
          "The developer types code on a laptop",
          "The developer types code on a computer",
          "The developer writes code on a laptop",
          "The developer writes code on a computer",
          "The engineer types code on a laptop",
          "The engineer types code on a computer",
          "The engineer writes code on a laptop",
          "The engineer writes code on a computer",
        ],
        videoUrl:VIDEOS.BB, imageUrl:"https://images.pexels.com/photos/577585/pexels-photo-577585.jpeg?auto=compress&cs=tinysrgb&w=800", poster:"https://images.pexels.com/photos/577585/pexels-photo-577585.jpeg?auto=compress&cs=tinysrgb&w=800", note:"Typing code is the most direct visual of software development." },

      { id:"t2", mediaType:"video", sentence:"two engineers review the code together",
        coreWords:["Two","engineers","review","the","code","together"],
        extraWords:["developers","discuss","screen"],
        acceptedSentences:[
          "Two engineers review the code together",
          "Two engineers review the screen together",
          "Two engineers discuss the code together",
          "Two engineers discuss the screen together",
          "Two developers review the code together",
          "Two developers review the screen together",
          "Two developers discuss the code together",
          "Two developers discuss the screen together",
        ],
        videoUrl:VIDEOS.BB, imageUrl:"https://images.pexels.com/photos/1181359/pexels-photo-1181359.jpeg?auto=compress&cs=tinysrgb&w=800", poster:"https://images.pexels.com/photos/1181359/pexels-photo-1181359.jpeg?auto=compress&cs=tinysrgb&w=800", note:"A pair review shows collaborative technical communication." },

      { id:"t3", mediaType:"image", sentence:"the server rack is in the data centre",
        coreWords:["The","server","rack","is","in","the","data","centre"],
        extraWords:["cabinet","room","beside"],
        acceptedSentences:[
          "The server rack is in the data centre",
          "The server rack is in the cabinet",
          "The server rack is in the room",
          "The server rack is beside the data centre",
          "The server rack is beside the cabinet",
          "The server rack is beside the room",
        ],
        videoUrl:VIDEOS.BB, imageUrl:"https://images.pexels.com/photos/325229/pexels-photo-325229.jpeg?auto=compress&cs=tinysrgb&w=800", poster:"https://images.pexels.com/photos/325229/pexels-photo-325229.jpeg?auto=compress&cs=tinysrgb&w=800", note:"Server racks house the computers that power every website and app." },

      { id:"t4", mediaType:"image", sentence:"the engineer is looking at three screens",
        coreWords:["The","engineer","is","looking","at","three","screens"],
        extraWords:["developer","typing","two"],
        acceptedSentences:[
          "The engineer is looking at three screens",
          "The engineer is looking at two screens",
          "The engineer is typing at three screens",
          "The engineer is typing at two screens",
          "The developer is looking at three screens",
          "The developer is looking at two screens",
          "The developer is typing at three screens",
          "The developer is typing at two screens",
        ],
        videoUrl:VIDEOS.BB, imageUrl:"https://images.pexels.com/photos/1181316/pexels-photo-1181316.jpeg?auto=compress&cs=tinysrgb&w=800", poster:"https://images.pexels.com/photos/1181316/pexels-photo-1181316.jpeg?auto=compress&cs=tinysrgb&w=800", note:"Multiple monitors let engineers view code, logs, and dashboards at once." },

      { id:"t5", mediaType:"image", sentence:"the code is on the screen",
        coreWords:["The","code","is","on","the","screen"],
        extraWords:["text","beside","keyboard"],
        acceptedSentences:[
          "The code is on the screen",
          "The code is on the keyboard",
          "The code is beside the screen",
          "The code is beside the keyboard",
          "The text is on the screen",
          "The text is on the keyboard",
          "The text is beside the screen",
          "The text is beside the keyboard",
        ],
        videoUrl:VIDEOS.BB, imageUrl:"https://images.pexels.com/photos/4974914/pexels-photo-4974914.jpeg?auto=compress&cs=tinysrgb&w=800", poster:"https://images.pexels.com/photos/4974914/pexels-photo-4974914.jpeg?auto=compress&cs=tinysrgb&w=800", note:"Every program starts as text on a screen." },
    ]},

  { id:"business", label:"Business", icon:"◈", description:"Corporate communication & finance language", color:"#6b21a8", bg:"#faf5ff", border:"#e9d5ff",
    sentences:[
      { id:"b1", mediaType:"video", sentence:"the manager presents a chart to the team",
        coreWords:["The","manager","presents","a","chart","to","the","team"],
        extraWords:["shows","graph","group"],
        acceptedSentences:[
          "The manager presents a chart to the team",
          "The manager presents a chart to the group",
          "The manager presents a graph to the team",
          "The manager presents a graph to the group",
          "The manager shows a chart to the team",
          "The manager shows a chart to the group",
          "The manager shows a graph to the team",
          "The manager shows a graph to the group",
        ],
        videoUrl:VIDEOS.B1, imageUrl:"https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=800", poster:"https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=800", note:"Presenting a chart is a concrete business communication action." },

      { id:"b2", mediaType:"video", sentence:"the two partners shake hands after the deal",
        coreWords:["The","two","partners","shake","hands","after","the","deal"],
        extraWords:["colleagues","agreement","meeting"],
        acceptedSentences:[
          "The two partners shake hands after the deal",
          "The two partners shake hands after the agreement",
          "The two partners shake hands after the meeting",
          "The two colleagues shake hands after the deal",
          "The two colleagues shake hands after the agreement",
          "The two colleagues shake hands after the meeting",
        ],
        videoUrl:VIDEOS.B2, imageUrl:"https://images.pexels.com/photos/8460158/pexels-photo-8460158.jpeg?auto=compress&cs=tinysrgb&w=800", poster:"https://images.pexels.com/photos/8460158/pexels-photo-8460158.jpeg?auto=compress&cs=tinysrgb&w=800", note:"A handshake is the universally understood symbol of a sealed deal." },

      { id:"b3", mediaType:"image", sentence:"the woman is writing in her notebook",
        coreWords:["The","woman","is","writing","in","her","notebook"],
        extraWords:["man","reading","diary"],
        acceptedSentences:[
          "The woman is writing in her notebook",
          "The woman is writing in her diary",
          "The woman is reading in her notebook",
          "The woman is reading in her diary",
          "The man is writing in his notebook",
          "The man is writing in his diary",
          "The man is reading in his notebook",
          "The man is reading in his diary",
        ],
        videoUrl:VIDEOS.BB, imageUrl:"https://images.pexels.com/photos/6476589/pexels-photo-6476589.jpeg?auto=compress&cs=tinysrgb&w=800", poster:"https://images.pexels.com/photos/6476589/pexels-photo-6476589.jpeg?auto=compress&cs=tinysrgb&w=800", note:"Writing in a notebook captures decisions and action items." },

      { id:"b4", mediaType:"image", sentence:"the team is sitting around the table",
        coreWords:["The","team","is","sitting","around","the","table"],
        extraWords:["group","standing","desk"],
        acceptedSentences:[
          "The team is sitting around the table",
          "The team is sitting around the desk",
          "The team is standing around the table",
          "The team is standing around the desk",
          "The group is sitting around the table",
          "The group is sitting around the desk",
          "The group is standing around the table",
          "The group is standing around the desk",
        ],
        videoUrl:VIDEOS.BB, imageUrl:"https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800", poster:"https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800", note:"A shared table puts everyone at the same level for discussion." },

      { id:"b5", mediaType:"image", sentence:"the businessman is talking on the phone",
        coreWords:["The","businessman","is","talking","on","the","phone"],
        extraWords:["woman","listening","radio"],
        acceptedSentences:[
          "The businessman is talking on the phone",
          "The businessman is talking on the radio",
          "The businessman is listening on the phone",
          "The businessman is listening on the radio",
          "The woman is talking on the phone",
          "The woman is talking on the radio",
          "The woman is listening on the phone",
          "The woman is listening on the radio",
        ],
        videoUrl:VIDEOS.BB, imageUrl:"https://images.pexels.com/photos/3760067/pexels-photo-3760067.jpeg?auto=compress&cs=tinysrgb&w=800", poster:"https://images.pexels.com/photos/3760067/pexels-photo-3760067.jpeg?auto=compress&cs=tinysrgb&w=800", note:"'On the phone' — always 'on', never 'in' or 'at'." },
    ]},

  { id:"daily", label:"Daily Life", icon:"◉", description:"Everyday actions & common situations", color:"#065f46", bg:"#f0fdf4", border:"#86efac",
    sentences:[
      { id:"d1", mediaType:"image", sentence:"the bicycle is leaning against the fence",
        coreWords:["The","bicycle","is","leaning","against","the","fence"],
        extraWords:["parked","beside","wall"],
        acceptedSentences:[
          "The bicycle is leaning against the fence",
          "The bicycle is leaning against the wall",
          "The bicycle is parked against the fence",
          "The bicycle is parked against the wall",
          "The bicycle is beside the fence",
          "The bicycle is beside the wall",
        ],
        videoUrl:VIDEOS.BB, imageUrl:"https://res.cloudinary.com/dpvt8qcs8/image/upload/v1773222146/20260311_1447_Bicycle_by_Fence_simple_compose_01kke304twfpzvap7cwpfm3sv2_qd4odd.png", poster:"https://res.cloudinary.com/dpvt8qcs8/image/upload/v1773222146/20260311_1447_Bicycle_by_Fence_simple_compose_01kke304twfpzvap7cwpfm3sv2_qd4odd.png", note:"'Leaning against' describes position without movement — perfect for images." },

      { id:"d2", mediaType:"image", sentence:"the bag is hanging from the hook",
        coreWords:["The","bag","is","hanging","from","the","hook"],
        extraWords:["purse","on","nail"],
        acceptedSentences:[
          "The bag is hanging from the hook",
          "The bag is hanging from the nail",
          "The bag is hanging on the hook",
          "The bag is hanging on the nail",
          "The purse is hanging from the hook",
          "The purse is hanging from the nail",
          "The purse is hanging on the hook",
          "The purse is hanging on the nail",
        ],
        videoUrl:VIDEOS.BB, imageUrl:"https://res.cloudinary.com/dpvt8qcs8/image/upload/v1773222100/20260311_1457_Image_Generation_simple_compose_01kke3j57reddvhqgf2gt6jgqg_pfmjkj.png", poster:"https://res.cloudinary.com/dpvt8qcs8/image/upload/v1773222100/20260311_1457_Image_Generation_simple_compose_01kke3j57reddvhqgf2gt6jgqg_pfmjkj.png", note:"'Is hanging' describes a state/position, not an action." },

      { id:"d3", mediaType:"image", sentence:"the christmas lights are strung along the roof",
        coreWords:["The","christmas","lights","are","strung","along","the","roof"],
        extraWords:["hung","across","house"],
        acceptedSentences:[
          "The christmas lights are strung along the roof",
          "The christmas lights are strung along the house",
          "The christmas lights are strung across the roof",
          "The christmas lights are strung across the house",
          "The christmas lights are hung along the roof",
          "The christmas lights are hung along the house",
          "The christmas lights are hung across the roof",
          "The christmas lights are hung across the house",
          "The lights are strung along the roof",
          "The lights are strung along the house",
          "The lights are strung across the roof",
          "The lights are strung across the house",
          "The lights are hung along the roof",
          "The lights are hung along the house",
          "The lights are hung across the roof",
          "The lights are hung across the house",
        ],
        videoUrl:VIDEOS.BB, imageUrl:"https://res.cloudinary.com/dpvt8qcs8/image/upload/v1773222142/20260311_1501_Image_Generation_simple_compose_01kke3r5pxe7mvy7zpt9tj1xcv_vmqtit.png", poster:"https://res.cloudinary.com/dpvt8qcs8/image/upload/v1773222142/20260311_1501_Image_Generation_simple_compose_01kke3r5pxe7mvy7zpt9tj1xcv_vmqtit.png", note:"'Are strung' describes the result state — the lights are already in place." },

      { id:"d4", mediaType:"image", sentence:"the laundry is hanging on the line",
        coreWords:["The","laundry","is","hanging","on","the","line"],
        extraWords:["clothes","across","rope"],
        acceptedSentences:[
          "The laundry is hanging on the line",
          "The laundry is hanging on the rope",
          "The laundry is hanging across the line",
          "The laundry is hanging across the rope",
          "The clothes are hanging on the line",
          "The clothes are hanging on the rope",
          "The clothes are hanging across the line",
          "The clothes are hanging across the rope",
        ],
        videoUrl:VIDEOS.BB, imageUrl:"https://res.cloudinary.com/dpvt8qcs8/image/upload/v1774854243/20260330_1233_Image_Generation_simple_compose_01kmyrv2mdehrbywq955k8439s_wxepdv.png", poster:"https://res.cloudinary.com/dpvt8qcs8/image/upload/v1774854243/20260330_1233_Image_Generation_simple_compose_01kmyrv2mdehrbywq955k8439s_wxepdv.png", note:"'Is hanging' shows the state of the clothes — already on the line, not being hung." },

      { id:"d5", mediaType:"image", sentence:"the cat is curled up on the bed",
        coreWords:["The","cat","is","curled","up","on","the","bed"],
        extraWords:["sleeping","sofa","couch"],
        acceptedSentences:[
          "The cat is curled up on the bed",
          "The cat is curled up on the sofa",
          "The cat is curled up on the couch",
          "The cat is sleeping on the bed",
          "The cat is sleeping on the sofa",
          "The cat is sleeping on the couch",
        ],
        videoUrl:VIDEOS.BB, imageUrl:"https://res.cloudinary.com/dpvt8qcs8/image/upload/v1774854248/20260330_1232_Image_Generation_simple_compose_01kmyrse8xe2vs08g4nf0xw8mp_x8uoh9.png", poster:"https://res.cloudinary.com/dpvt8qcs8/image/upload/v1774854248/20260330_1232_Image_Generation_simple_compose_01kmyrse8xe2vs08g4nf0xw8mp_x8uoh9.png", note:"'Is curled up' describes the cat's position/state — perfect for a peaceful image." },

      { id:"d6", mediaType:"video", sentence:"a boy runs after a dog in the park",
        coreWords:["A","boy","runs","after","a","dog","in","the","park"],
        extraWords:["chases","behind","cat"],
        acceptedSentences:[
          "A boy runs after a dog in the park",
          "A boy runs after a cat in the park",
          "A boy runs behind a dog in the park",
          "A boy runs behind a cat in the park",
          "A boy chases a dog in the park",
          "A boy chases a cat in the park",
        ],
        videoUrl:VIDEOS.D1, imageUrl:"https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&w=800", poster:"https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&w=800", note:"A boy chasing a dog is a natural, energetic everyday scene." },

      { id:"d7", mediaType:"video", sentence:"the woman pours water into a glass",
        coreWords:["The","woman","pours","water","into","a","glass"],
        extraWords:["fills","cup","slowly"],
        acceptedSentences:[
          "The woman pours water into a glass",
          "The woman pours water into a cup",
          "The woman fills a glass with water",
          "The woman fills a cup with water",
        ],
        videoUrl:VIDEOS.D2, imageUrl:"https://images.pexels.com/photos/887827/pexels-photo-887827.jpeg?auto=compress&cs=tinysrgb&w=800", poster:"https://images.pexels.com/photos/887827/pexels-photo-887827.jpeg?auto=compress&cs=tinysrgb&w=800", note:"Pouring water demonstrates subject-verb-object structure clearly." },

      // ── 14 NEW SENTENCES ─────────────────────────────────────────────────────

      { id:"d8", mediaType:"image", sentence:"the fish are in the tank",
        coreWords:["The","fish","are","in","the","tank"],
        extraWords:["swimming","beside","bowl"],
        acceptedSentences:[
          "The fish are in the tank",
          "The fish are in the bowl",
          "The fish are beside the tank",
          "The fish are beside the bowl",
          "The fish are swimming in the tank",
          "The fish are swimming in the bowl",
        ],
        videoUrl:VIDEOS.BB, imageUrl:"https://res.cloudinary.com/dpvt8qcs8/image/upload/v1774851165/20260326_1714_Fish_in_Tank_simple_compose_01kmmzadgxfb28wp2kf7x8px8m_ijugio.png", poster:"https://res.cloudinary.com/dpvt8qcs8/image/upload/v1774851165/20260326_1714_Fish_in_Tank_simple_compose_01kmmzadgxfb28wp2kf7x8px8m_ijugio.png", note:"'Fish' is its own plural — we never say 'fishes' in everyday English. Use 'are', not 'is'." },

      { id:"d9", mediaType:"image", sentence:"the snail is on the leaf",
        coreWords:["The","snail","is","on","the","leaf"],
        extraWords:["sitting","beside","flower"],
        acceptedSentences:[
          "The snail is on the leaf",
          "The snail is on the flower",
          "The snail is beside the leaf",
          "The snail is beside the flower",
          "The snail is sitting on the leaf",
          "The snail is sitting on the flower",
        ],
        videoUrl:VIDEOS.BB, imageUrl:"https://res.cloudinary.com/dpvt8qcs8/image/upload/v1774851173/20260326_1709_Image_Generation_simple_compose_01kmmz1c96eewvmncw1akv3xnk_dsdnup.png", poster:"https://res.cloudinary.com/dpvt8qcs8/image/upload/v1774851173/20260326_1709_Image_Generation_simple_compose_01kmmz1c96eewvmncw1akv3xnk_dsdnup.png", note:"'On the leaf' — use 'on' for surfaces. The snail rests on top of the leaf." },

      { id:"d10", mediaType:"image", sentence:"the butterfly is on the flower",
        coreWords:["The","butterfly","is","on","the","flower"],
        extraWords:["resting","beside","leaf"],
        acceptedSentences:[
          "The butterfly is on the flower",
          "The butterfly is on the leaf",
          "The butterfly is beside the flower",
          "The butterfly is beside the leaf",
          "The butterfly is resting on the flower",
          "The butterfly is resting on the leaf",
        ],
        videoUrl:VIDEOS.BB, imageUrl:"https://res.cloudinary.com/dpvt8qcs8/image/upload/v1774851163/20260326_1708_Image_Generation_simple_compose_01kmmz0shrfjjbtndj1qbyv9qs_vxjpcd.png", poster:"https://res.cloudinary.com/dpvt8qcs8/image/upload/v1774851163/20260326_1708_Image_Generation_simple_compose_01kmmz0shrfjjbtndj1qbyv9qs_vxjpcd.png", note:"'Is on the flower' describes where the butterfly is right now — a state, not movement." },

      { id:"d11", mediaType:"image", sentence:"the schoolbag is beside the bench",
        coreWords:["The","schoolbag","is","beside","the","bench"],
        extraWords:["bag","under","chair"],
        acceptedSentences:[
          "The schoolbag is beside the bench",
          "The schoolbag is beside the chair",
          "The schoolbag is under the bench",
          "The schoolbag is under the chair",
          "The bag is beside the bench",
          "The bag is beside the chair",
          "The bag is under the bench",
          "The bag is under the chair",
        ],
        videoUrl:VIDEOS.BB, imageUrl:"https://res.cloudinary.com/dpvt8qcs8/image/upload/v1774851161/20260326_1715_Image_Generation_simple_compose_01kmmzd8r6fw2sp5y4tygvc7b7_r2khim.png", poster:"https://res.cloudinary.com/dpvt8qcs8/image/upload/v1774851161/20260326_1715_Image_Generation_simple_compose_01kmmzd8r6fw2sp5y4tygvc7b7_r2khim.png", note:"'Beside' means next to — the bag is at the side of the bench, not on it." },

      { id:"d12", mediaType:"image", sentence:"the pot is on the garden wall",
        coreWords:["The","pot","is","on","the","garden","wall"],
        extraWords:["flowerpot","beside","fence"],
        acceptedSentences:[
          "The pot is on the garden wall",
          "The pot is on the fence",
          "The pot is beside the garden wall",
          "The pot is beside the fence",
          "The flowerpot is on the garden wall",
          "The flowerpot is on the fence",
          "The flowerpot is beside the garden wall",
          "The flowerpot is beside the fence",
        ],
        videoUrl:VIDEOS.BB, imageUrl:"https://res.cloudinary.com/dpvt8qcs8/image/upload/v1774851161/20260326_1639_Image_Generation_simple_compose_01kmmxb9sgfbntqmp8pdzyvngj_fxriy1.png", poster:"https://res.cloudinary.com/dpvt8qcs8/image/upload/v1774851161/20260326_1639_Image_Generation_simple_compose_01kmmxb9sgfbntqmp8pdzyvngj_fxriy1.png", note:"'On the wall' means sitting on top of the wall — a common sight in gardens." },

      { id:"d13", mediaType:"image", sentence:"the crayons are in the box",
        coreWords:["The","crayons","are","in","the","box"],
        extraWords:["pencils","beside","basket"],
        acceptedSentences:[
          "The crayons are in the box",
          "The crayons are in the basket",
          "The crayons are beside the box",
          "The crayons are beside the basket",
          "The pencils are in the box",
          "The pencils are in the basket",
          "The pencils are beside the box",
          "The pencils are beside the basket",
        ],
        videoUrl:VIDEOS.BB, imageUrl:"https://res.cloudinary.com/dpvt8qcs8/image/upload/v1774851161/20260326_1654_Image_Generation_simple_compose_01kmmy67gweqpak3da1nt1wy7y_z7ilht.png", poster:"https://res.cloudinary.com/dpvt8qcs8/image/upload/v1774851161/20260326_1654_Image_Generation_simple_compose_01kmmy67gweqpak3da1nt1wy7y_z7ilht.png", note:"'In the box' — crayons are stored inside the box. Use 'in' for containers." },

      { id:"d14", mediaType:"image", sentence:"the rabbit is in the garden",
        coreWords:["The","rabbit","is","in","the","garden"],
        extraWords:["sitting","beside","park"],
        acceptedSentences:[
          "The rabbit is in the garden",
          "The rabbit is in the park",
          "The rabbit is beside the garden",
          "The rabbit is beside the park",
          "The rabbit is sitting in the garden",
          "The rabbit is sitting in the park",
        ],
        videoUrl:VIDEOS.BB, imageUrl:"https://res.cloudinary.com/dpvt8qcs8/image/upload/v1774851163/20260326_1653_Image_Generation_simple_compose_01kmmy59tdfd59ht0b3yfzrfxd_n0vnjw.png", poster:"https://res.cloudinary.com/dpvt8qcs8/image/upload/v1774851163/20260326_1653_Image_Generation_simple_compose_01kmmy59tdfd59ht0b3yfzrfxd_n0vnjw.png", note:"'In the garden' — use 'in' for open spaces with boundaries like a garden or park." },

      { id:"d15", mediaType:"image", sentence:"the cat is on the windowsill",
        coreWords:["The","cat","is","on","the","windowsill"],
        extraWords:["sitting","beside","ledge"],
        acceptedSentences:[
          "The cat is on the windowsill",
          "The cat is on the ledge",
          "The cat is beside the windowsill",
          "The cat is beside the ledge",
          "The cat is sitting on the windowsill",
          "The cat is sitting on the ledge",
        ],
        videoUrl:VIDEOS.BB, imageUrl:"https://res.cloudinary.com/dpvt8qcs8/image/upload/v1774851162/20260326_1651_Cat_on_Sunlit_Windowsill_simple_compose_01kmmy075ee90sns4fm84d03ja_lr56oz.png", poster:"https://res.cloudinary.com/dpvt8qcs8/image/upload/v1774851162/20260326_1651_Cat_on_Sunlit_Windowsill_simple_compose_01kmmy075ee90sns4fm84d03ja_lr56oz.png", note:"Cats love windowsills — 'on' is used for surfaces like ledges and sills." },

      { id:"d16", mediaType:"image", sentence:"the swing is hanging from the tree",
        coreWords:["The","swing","is","hanging","from","the","tree"],
        extraWords:["rope","on","branch"],
        acceptedSentences:[
          "The swing is hanging from the tree",
          "The swing is hanging from the branch",
          "The swing is hanging on the tree",
          "The swing is hanging on the branch",
          "The rope is hanging from the tree",
          "The rope is hanging from the branch",
          "The rope is hanging on the tree",
          "The rope is hanging on the branch",
        ],
        videoUrl:VIDEOS.BB, imageUrl:"https://res.cloudinary.com/dpvt8qcs8/image/upload/v1774851163/20260326_1640_Wooden_Swing_in_Garden_simple_compose_01kmmxcpd0fgyt6bnnpwhmr14z_p0yfud.png", poster:"https://res.cloudinary.com/dpvt8qcs8/image/upload/v1774851163/20260326_1640_Wooden_Swing_in_Garden_simple_compose_01kmmxcpd0fgyt6bnnpwhmr14z_p0yfud.png", note:"'Hanging from' shows what the swing is attached to — it comes down from the tree." },

      { id:"d17", mediaType:"image", sentence:"the fruits are in the bowl",
        coreWords:["The","fruits","are","in","the","bowl"],
        extraWords:["basket","beside","apples"],
        acceptedSentences:[
          "The fruits are in the bowl",
          "The fruits are in the basket",
          "The fruits are beside the bowl",
          "The fruits are beside the basket",
          // "The apples are in the bowl",
          // "The apples are in the basket",
          // "The apples are beside the bowl",
          // "The apples are beside the basket",
        ],
        videoUrl:VIDEOS.BB, imageUrl:"https://res.cloudinary.com/dpvt8qcs8/image/upload/v1774851163/20260326_1649_Colorful_Fruit_Bowl_simple_compose_01kmmxxebhfxbbwqes05kpsc2q_gft3kp.png", poster:"https://res.cloudinary.com/dpvt8qcs8/image/upload/v1774851163/20260326_1649_Colorful_Fruit_Bowl_simple_compose_01kmmxxebhfxbbwqes05kpsc2q_gft3kp.png", note:"'Fruit' is uncountable — we say 'the fruit is', not 'the fruit are'." },

      { id:"d18", mediaType:"image", sentence:"the clock is on the wall",
        coreWords:["The","clock","is","on","the","wall"],
        extraWords:["watch","beside","shelf"],
        acceptedSentences:[
          "The clock is on the wall",
          "The clock is on the shelf",
          "The clock is beside the wall",
          "The clock is beside the shelf",
          "The watch is on the wall",
          "The watch is on the shelf",
          "The watch is beside the wall",
          "The watch is beside the shelf",
        ],
        videoUrl:VIDEOS.BB, imageUrl:"https://res.cloudinary.com/dpvt8qcs8/image/upload/v1774851587/20260326_1607_Image_Generation_simple_compose_01kmmvgtbpe1y8sakv5t50varr_1_kmo7yd.png", poster:"https://res.cloudinary.com/dpvt8qcs8/image/upload/v1774851587/20260326_1607_Image_Generation_simple_compose_01kmmvgtbpe1y8sakv5t50varr_1_kmo7yd.png", note:"'On the wall' — clocks are mounted on walls, so we use 'on', not 'in'." },

      { id:"d19", mediaType:"image", sentence:"the shoes are under the bed",
        coreWords:["The","shoes","are","under","the","bed"],
        extraWords:["slippers","beside","chair"],
        acceptedSentences:[
          "The shoes are under the bed",
          "The shoes are under the chair",
          "The shoes are beside the bed",
          "The shoes are beside the chair",
          "The slippers are under the bed",
          "The slippers are under the chair",
          "The slippers are beside the bed",
          "The slippers are beside the chair",
        ],
        videoUrl:VIDEOS.BB, imageUrl:"https://res.cloudinary.com/dpvt8qcs8/image/upload/v1774851603/20260326_1517_Image_Generation_simple_compose_01kmmrnrt0f8vs3zz2c338cnp9_pmhfkr.png", poster:"https://res.cloudinary.com/dpvt8qcs8/image/upload/v1774851603/20260326_1517_Image_Generation_simple_compose_01kmmrnrt0f8vs3zz2c338cnp9_pmhfkr.png", note:"'Under the bed' — 'under' means directly below something. Great for practising position words." },

      { id:"d20", mediaType:"image", sentence:"the glasses are on the shelf",
        coreWords:["The","glasses","are","on","the","shelf"],
        extraWords:["spectacles","beside","table"],
        acceptedSentences:[
          "The glasses are on the shelf",
          "The glasses are on the table",
          "The glasses are beside the shelf",
          "The glasses are beside the table",
          "The spectacles are on the shelf",
          "The spectacles are on the table",
          "The spectacles are beside the shelf",
          "The spectacles are beside the table",
        ],
        videoUrl:VIDEOS.BB, imageUrl:"https://res.cloudinary.com/dpvt8qcs8/image/upload/v1774851161/20260326_1630_Image_Generation_simple_compose_01kmmwt3mdf1rvnsb6dwk8ekm3_pugmph.png", poster:"https://res.cloudinary.com/dpvt8qcs8/image/upload/v1774851161/20260326_1630_Image_Generation_simple_compose_01kmmwt3mdf1rvnsb6dwk8ekm3_pugmph.png", note:"'Glasses' is always plural — we say 'the glasses are', never 'the glasses is'." },

      { id:"d21", mediaType:"image", sentence:"the keys are on the counter",
        coreWords:["The","keys","are","on","the","counter"],
        extraWords:["beside","table","shelf"],
        acceptedSentences:[
          "The keys are on the counter",
          "The keys are on the table",
          "The keys are on the shelf",
          "The keys are beside the counter",
          "The keys are beside the table",
          "The keys are beside the shelf",
        ],
        videoUrl:VIDEOS.BB, imageUrl:"https://res.cloudinary.com/dpvt8qcs8/image/upload/v1774851604/20260326_1604_Image_Generation_simple_compose_01kmmvakewew7rg5nqhgg9f7gd_zeaewu.png", poster:"https://res.cloudinary.com/dpvt8qcs8/image/upload/v1774851604/20260326_1604_Image_Generation_simple_compose_01kmmvakewew7rg5nqhgg9f7gd_zeaewu.png", note:"'Keys' is always plural — use 'are'. 'On the counter' means resting on top of the surface." },

      { id:"d22", mediaType:"image", sentence:"the newspaper is on the chair",
        coreWords:["The","newspaper","is","on","the","chair"],
        extraWords:["magazine","beside","table"],
        acceptedSentences:[
          "The newspaper is on the chair",
          "The newspaper is on the table",
          "The newspaper is beside the chair",
          "The newspaper is beside the table",
          "The magazine is on the chair",
          "The magazine is on the table",
          "The magazine is beside the chair",
          "The magazine is beside the table",
        ],
        videoUrl:VIDEOS.BB, imageUrl:"https://res.cloudinary.com/dpvt8qcs8/image/upload/v1774851586/20260326_1627_Image_Generation_simple_compose_01kmmwngbnfttah5c6vvyw8s2g_fh1du6.png", poster:"https://res.cloudinary.com/dpvt8qcs8/image/upload/v1774851586/20260326_1627_Image_Generation_simple_compose_01kmmwngbnfttah5c6vvyw8s2g_fh1du6.png", note:"'On the chair' — use 'on' for surfaces. The newspaper rests on top of the chair." },

      { id:"d23", mediaType:"image", sentence:"the ruler is on the notebook",
        coreWords:["The","ruler","is","on","the","notebook"],
        extraWords:["pencil","beside","book"],
        acceptedSentences:[
          "The ruler is on the notebook",
          "The ruler is on the book",
          "The ruler is beside the notebook",
          "The ruler is beside the book",
          "The pencil is on the notebook",
          "The pencil is on the book",
          "The pencil is beside the notebook",
          "The pencil is beside the book",
        ],
        videoUrl:VIDEOS.BB, imageUrl:"https://res.cloudinary.com/dpvt8qcs8/image/upload/v1774851164/20260326_1715_Ruler_on_Notebook_simple_compose_01kmmzcgtzfhr9mng018ggwzsv_e1wj1g.png", poster:"https://res.cloudinary.com/dpvt8qcs8/image/upload/v1774851164/20260326_1715_Ruler_on_Notebook_simple_compose_01kmmzcgtzfhr9mng018ggwzsv_e1wj1g.png", note:"'On the notebook' — the ruler lies flat on top of the notebook surface." },
    ]},
];

const GRAMMAR_GUIDE = [
  { id:"structure", icon:"①", title:"Sentence Structure", color:"#1d4ed8", bg:"#eff6ff", rule:"Every sentence needs: Subject → Verb → Object (+place/time)", examples:[{label:"✓ Correct",text:"The doctor checks the patient's pulse"},{label:"✗ Wrong",text:"checks doctor the pulse patient's"}], tip:"Always start with WHO is doing the action." },
  { id:"capital", icon:"②", title:"Capital First Letter", color:"#0f766e", bg:"#f0fdfa", rule:"The first word of every sentence must start with a capital letter.", examples:[{label:"✓ Correct",text:"The nurse gives the patient an injection"},{label:"✗ Wrong",text:"the nurse gives the patient an injection"}], tip:"The first word in the word bank is always capitalised." },
  { id:"article", icon:"③", title:"A vs An", color:"#92400e", bg:"#fffbeb", rule:"Use 'a' before consonant sounds, 'an' before vowel sounds (a,e,i,o,u).", examples:[{label:"✓ Correct",text:"an injection (vowel i)"},{label:"✗ Wrong",text:"a injection"}], tip:"injection starts with 'i' → use 'an'." },
  { id:"continuous", icon:"④", title:"Present Continuous", color:"#6b21a8", bg:"#faf5ff", rule:"For actions happening RIGHT NOW: is/are + verb-ing", examples:[{label:"✓ Correct",text:"The doctor is listening to the chest"},{label:"✗ Wrong",text:"The doctor is listen to the chest"}], tip:"After 'is'/'are', the verb always ends in -ing." },
  { id:"singular", icon:"⑤", title:"Subject-Verb Agreement", color:"#065f46", bg:"#f0fdf4", rule:"Singular subject → verb gets an -s ending.", examples:[{label:"✓ Correct",text:"The doctor checks the pulse"},{label:"✗ Wrong",text:"The doctor check the pulse"}], tip:"One person doing something → add -s to the action word." },
  { id:"extrawords", icon:"⑥", title:"Ignore Extra Words", color:"#be185d", bg:"#fdf2f8", rule:"The word bank always contains distractor words. Not all belong.", examples:[{label:"Tip",text:"If a word doesn't fit naturally, leave it in the bank."}], tip:"Ask: does this word make the sentence clearer?" },
];

// Pool of preposition/connector distractors
const PREP_DISTRACTOR_POOL = ["with","by","from","into","over","through","after","before","about","between","around","during","for","but","and"];

// Randomly inject 2–3 preposition distractors into ~half the sentences
function getExtraDistractors(core, extra) {
  if (Math.random() < 0.5) return [];
  const used = new Set([...core, ...extra].map(w => w.toLowerCase()));
  const available = PREP_DISTRACTOR_POOL.filter(p => !used.has(p));
  const shuffled = available.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 2 + Math.floor(Math.random() * 2));
}

function buildBank(core, extra) {
  const prepDistractors = getExtraDistractors(core, extra);
  return [...core, ...extra, ...prepDistractors]
    .map((w, i) => ({ w, id: `${i}_${w}_${Math.random().toString(36).slice(2,6)}` }))
    .sort(() => Math.random() - 0.5);
}

function domainColor(i) {
  const p=[{color:"#b45309",bg:"#fffbeb",border:"#fde68a"},{color:"#0369a1",bg:"#f0f9ff",border:"#bae6fd"},{color:"#7c3aed",bg:"#faf5ff",border:"#ddd6fe"},{color:"#be185d",bg:"#fdf2f8",border:"#fbcfe8"},{color:"#0f766e",bg:"#f0fdfa",border:"#99f6e4"},{color:"#1d4ed8",bg:"#eff6ff",border:"#bfdbfe"}];
  return p[i % p.length];
}

function tok(s){return s.toLowerCase().trim().replace(/[^a-z0-9\s']/g,"").split(/\s+/).filter(Boolean);}

function positionalScore(ut, rt) {
  const len = Math.max(ut.length, rt.length);
  if (len === 0) return 0;
  let correct = 0;
  for (let i = 0; i < Math.min(ut.length, rt.length); i++) {
    if (ut[i] === rt[i]) correct++;
  }
  return correct / len;
}

function mkFeedback(ut, bestRef, acceptedSentences) {
  const allValidWords = new Set(acceptedSentences.flatMap(tok));
  const badWord = ut.find(w => !allValidWords.has(w));
  if (badWord) return "try again";
  const sameWords = [...ut].sort().join() === [...bestRef].sort().join();
  if (sameWords) return "Right words — wrong order. Try rearranging.";
  const missing = bestRef.find(w => !ut.includes(w));
  if (missing) return "try again";
  if (ut.length > bestRef.length) return "try again";
  return "Not quite — check your word order.";
}

const SING=new Set(["doctor","nurse","lawyer","judge","person","manager","developer","engineer","businessman","businesswoman","woman","man","girl","boy","family","team","partner","colleague","client","gavel","rack","code","pill","book","snail","butterfly","schoolbag","pot","flowerpot","rabbit","cat","swing","rope","clock","watch","fruit","laundry","bicycle","bag","purse"]);
const NUMS=new Set(["two","three","four","five","six","seven","eight","nine","ten"]);
const bare=w=>w.replace(/[^a-z']/gi,"").toLowerCase();
const isIng=w=>bare(w).endsWith("ing");
const is3ps=w=>{const b=bare(w);return b.endsWith("s")&&!b.endsWith("ss");};
const vow=w=>/^[aeiou]/i.test(w);
function grammarCheck(words){
  const w=[],t=words.map(bare);
  if(words[0]&&words[0][0]!==words[0][0].toUpperCase())w.push(`Capitalise the first word.`);
  for(let i=0;i<t.length-1;i++){
    if(t[i]==="a"&&vow(t[i+1]))w.push(`Use "an" before "${t[i+1]}".`);
    if(t[i]==="an"&&!vow(t[i+1]))w.push(`Use "a" before "${t[i+1]}".`);
    if((t[i]==="is"||t[i]==="are")&&t[i+1]&&!new Set(["the","a","an","to","in","on","at","by","with","not"]).has(t[i+1])&&!isIng(t[i+1]))w.push(`After "${t[i]}", use the -ing form.`);
  }
  for(let i=0;i<t.length-1;i++){const s=t[i]==="the"?t[i+1]:t[i];const vi=t[i]==="the"?i+2:i+1;if(SING.has(s)&&vi<t.length){const v=t[vi];if(!new Set(["is","are","was","were","has","have","had","the","a","an","to","in","on","at"]).has(v)&&!isIng(v)&&!is3ps(v)&&v.length>2){w.push(`"${s}" is singular — use "${v}s".`);break;}}}
  for(let i=0;i<t.length-1;i++)if(NUMS.has(t[i])&&t[i+1]&&!t[i+1].endsWith("s")&&!["the","a","an"].includes(t[i+1]))w.push(`After "${t[i]}", use plural — "${t[i+1]}s".`);
  for(let i=0;i<t.length-1;i++)if(t[i]===t[i+1])w.push(`"${t[i]}" appears twice — remove one.`);
  return w;
}

async function evaluate(userSentence, sentence) {
  const norm = userSentence.toLowerCase().trim();
  if (sentence.acceptedSentences.some(s => s.toLowerCase().trim() === norm)) {
    return { correct: true, warnings: grammarCheck(userSentence.split(" ")) };
  }
  const ut = tok(userSentence);
  let bestScore = 0;
  let bestRef = [];
  for (const accepted of sentence.acceptedSentences) {
    const rt = tok(accepted);
    const score = positionalScore(ut, rt);
    if (score > bestScore) { bestScore = score; bestRef = rt; }
  }
  if (bestScore >= 0.95) {
    return { correct: true, warnings: grammarCheck(userSentence.split(" ")) };
  }
  return { correct: false, fb: mkFeedback(ut, bestRef, sentence.acceptedSentences) };
}

async function generateDomain(query){
  const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1200,messages:[{role:"user",content:`Generate sentences for the domain: "${query}". Create exactly 4 sentences: 2 mediaType "video", 2 mediaType "image". 5-9 words, domain-specific, grammatically correct. First coreWord capitalised. No full stops. Each needs extraWords (2-3), acceptedSentences (ALL valid combinations of core+extra words — enumerate every possible valid swap), note. ONLY valid JSON: {"label":"","description":"","icon":"","sentences":[{"mediaType":"","sentence":"","coreWords":[],"extraWords":[],"acceptedSentences":[],"note":""}]}`}]})});
  const data=await res.json();
  const raw=data.content?.map(b=>b.text||"").join("").trim();
  const parsed=JSON.parse(raw.replace(/```json|```/g,"").trim());
  const cs=domainColor(Math.floor(Math.random()*6));
  const pids=["3184465","3778603","1181359","577585","256417","1619651"];
  return{id:`custom_${Date.now()}`,label:parsed.label,description:parsed.description,icon:parsed.icon||"✦",...cs,isCustom:true,sentences:parsed.sentences.map((s,i)=>({id:`custom_${i}_${Date.now()}`,mediaType:s.mediaType||"image",sentence:s.sentence.toLowerCase().trim(),coreWords:s.coreWords,extraWords:s.extraWords||[],acceptedSentences:s.acceptedSentences||[s.sentence],videoUrl:VIDEOS.BB,imageUrl:`https://images.pexels.com/photos/${pids[i%pids.length]}/pexels-photo-${pids[i%pids.length]}.jpeg?auto=compress&cs=tinysrgb&w=800`,poster:`https://images.pexels.com/photos/${pids[i%pids.length]}/pexels-photo-${pids[i%pids.length]}.jpeg?auto=compress&cs=tinysrgb&w=800`,note:s.note}))};
}

const Chk=({s=13})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20,6 9,17 4,12"/></svg>;
const ArrowL=()=><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12,19 5,12 12,5"/></svg>;
const ArrowR=()=><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12,5 19,12 12,19"/></svg>;
const SearchIc=()=><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4a6fa5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const Spn=()=><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{animation:"spin .8s linear infinite"}}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>;
const PlayIc=()=><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg>;
const ResetIc=()=><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1,4 1,10 7,10"/><path d="M3.51 15a9 9 0 1 0 .49-3.54"/></svg>;
const VidIc=({sz=18})=><svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="15" height="14" rx="2"/><polygon points="17,10 22,7 22,17 17,14"/></svg>;
const ImgIc=({sz=18})=><svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21,15 16,10 5,21"/></svg>;
const AlertIc=()=><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
const LockIc=({sz=22})=><svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
const StarIc=({filled,sz=16,col="currentColor"})=><svg width={sz} height={sz} viewBox="0 0 24 24" fill={filled?"currentColor":"none"} stroke={col} strokeWidth="2" color={col}><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg>;
const BookIc=()=><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>;
const XIc=()=><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const BulbIc=()=><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="9" y1="18" x2="15" y2="18"/><line x1="10" y1="22" x2="14" y2="22"/><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"/></svg>;

function StarCounter({ count, pop=false }) {
  return (
    <div className="star-counter">
      <span className="star-icon" style={{ animation: pop ? "starPop .45s cubic-bezier(.34,1.56,.64,1)" : "none" }}>
        <StarIc filled sz={14} col="#fbbf24"/>
      </span>
      <span className="star-count">{count}</span>
    </div>
  );
}

function CardFlipOverlay({ sentence, onDone }) {
  const [flipped,setFlipped]=useState(false);
  const [label,setLabel]=useState(false);
  useEffect(()=>{
    const t1=setTimeout(()=>setFlipped(true),350);
    const t2=setTimeout(()=>setLabel(true),1050);
    const t3=setTimeout(()=>onDone(),2100);
    return()=>{clearTimeout(t1);clearTimeout(t2);clearTimeout(t3);};
  },[]);
  return (
    <div className="flip-overlay">
      {label&&<p className="flip-label">🎉 New card unlocked!</p>}
      <div className="flip-container">
        <div className={`flip-card ${flipped ? 'flipped' : ''}`}>
          <div className="flip-card-front">
            <LockIc sz={30}/>
            <span>Locked</span>
          </div>
          <div className="flip-card-back">
            <img src={sentence.imageUrl} alt="" className="flip-image"/>
            <div className="flip-overlay-gradient"/>
            <div className="flip-content">
              <div className="flip-badge">
                <StarIc filled sz={10} col="#fbbf24"/>
                <span>UNLOCKED</span>
              </div>
              <p className="flip-text">New sentence ready!</p>
            </div>
          </div>
        </div>
      </div>
      <p className="flip-footer">Keep earning stars to unlock more cards</p>
    </div>
  );
}

function StarBurst({ onDone }) {
  useEffect(()=>{const t=setTimeout(onDone,1700);return()=>clearTimeout(t);},[]);
  return (
    <div className="star-burst">
      <div className="star-burst-content">
        <div>⭐</div>
        <div>Correct!</div>
        <div>+1 Star</div>
      </div>
    </div>
  );
}

function CardMapScreen({ domain, mediaMode, sentences, solved, totalStars, newlyUnlocked, onSelectCard, onBack }) {
  const [hov,setHov]=useState(null);
  const solvedCount=sentences.filter(s=>solved.has(s.id)).length;
  return (
    <div className="cardmap-screen">
      <header className="cardmap-header">
        <div className="cardmap-nav">
          <button onClick={onBack} className="back-button">
            <ArrowL/> Domains
          </button>
          <div className="divider"/>
          <div className="domain-badge">
            <div className="domain-icon" style={{background:domain.bg,borderColor:domain.border}}>{domain.icon}</div>
            <span className="domain-label">{domain.label}</span>
            <div className={`media-badge ${mediaMode}`}>
              {mediaMode==="image"?<><ImgIc sz={11}/> <span>IMAGE</span></>:<><VidIc sz={11}/> <span>VIDEO</span></>}
            </div>
          </div>
        </div>
        <StarCounter count={totalStars}/>
      </header>
      <div className="cardmap-progress">
        <p className="progress-stats">{solvedCount} of {sentences.length} solved</p>
        <h2>Choose a card to solve</h2>
        <p className="progress-hint">Solve free cards to earn ⭐ — stars automatically unlock the next locked card</p>
      </div>
      <div className="cards-container">
        <div className="cards-grid">
          {sentences.map((sentence,idx)=>{
            const threshold=UNLOCK_THRESHOLDS[idx]||0;
            const isLocked=totalStars<threshold;
            const isSolved=solved.has(sentence.id);
            const isNew=newlyUnlocked.has(sentence.id);
            const isH=hov===idx;
            const starsNeeded=threshold-totalStars;
            return (
              <div key={sentence.id}
                onMouseEnter={()=>!isLocked&&setHov(idx)}
                onMouseLeave={()=>setHov(null)}
                onClick={()=>!isLocked&&onSelectCard(idx)}
                className={`card ${isLocked ? 'locked' : ''} ${isSolved ? 'solved' : ''} ${isNew ? 'newly-unlocked' : ''}`}
                style={{animation:isNew?"cardReveal .5s cubic-bezier(.34,1.56,.64,1)":"none"}}>
                {/* {isLocked?(
                  <div className="locked-card">
                    <LockIc sz={22}/>
                    <p className="card-number">{idx+1}</p>
                    <div className="stars-needed">
                      <StarIc filled sz={10} col="#fbbf24"/><span>Need {starsNeeded} more ⭐</span>
                    </div>
                    <div className="progress-dots">
                      {Array.from({length:threshold}).map((_,i)=>(
                        <div key={i} className={`dot ${i<totalStars ? 'filled' : ''}`}/>
                      ))}
                    </div>
                  </div> */}

                  {isLocked?(
                  <>
                    <img src={sentence.imageUrl} alt="" className="card-image locked-blur"/>
                    <div className="locked-overlay">
                      <LockIc sz={26}/>
                      <div className="stars-needed">
                        <StarIc filled sz={10} col="#fbbf24"/><span>Need {starsNeeded} more ⭐</span>
                      </div>
                    </div>
                    <div className="card-number-badge">{idx+1}</div>
                  </>
                 ):(
                  <>
                    <img src={sentence.imageUrl} alt="" className="card-image"/>
                    <div className="card-overlay"/>
                    <div className="card-number-badge">{idx+1}</div>
                    {isSolved&&<div className="solved-badge"><Chk s={9}/><span>DONE</span></div>}
                    {isNew&&!isSolved&&<div className="new-badge"><span>NEW!</span></div>}
                    <div className="media-type">
                      {sentence.mediaType==="video"?<VidIc sz={11}/>:<ImgIc sz={11}/>}
                    </div>
                    <div className="card-caption">
                      <p>{isSolved?sentence.sentence:"Tap to solve"}</p>
                    </div>
                    {isH&&<div className="card-highlight" style={{borderColor:domain.color}}/>}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function GrammarGuide({ onClose }) {
  const [activeId,setActiveId]=useState(GRAMMAR_GUIDE[0].id);
  const rule=GRAMMAR_GUIDE.find(r=>r.id===activeId);
  return (
    <div className="grammar-guide-overlay">
      <div className="grammar-guide-modal">
        <div className="grammar-guide-header">
          <div className="grammar-guide-title">
            <div className="guide-icon"><BookIc/></div>
            <div>
              <p className="guide-title">Sentence Building Guide</p>
              <p className="guide-subtitle">6 rules for correct English</p>
            </div>
          </div>
          <button onClick={onClose} className="close-button"><XIc/></button>
        </div>
        <div className="grammar-guide-content">
          <div className="grammar-sidebar">
            {GRAMMAR_GUIDE.map(r=>(
              <button key={r.id} onClick={()=>setActiveId(r.id)} className={`guide-tab ${activeId===r.id ? 'active' : ''}`} style={{background:activeId===r.id?r.bg:"transparent"}}>
                <span style={{color:activeId===r.id?r.color:"#4a6fa5"}}>{r.icon}</span>
                <span style={{color:activeId===r.id?r.color:"#4a6fa5"}}>{r.title}</span>
              </button>
            ))}
          </div>
          <div className="grammar-detail">
            <div className="grammar-rule-header">
              <div className="grammar-rule-icon" style={{background:rule.bg,color:rule.color}}>{rule.icon}</div>
              <p className="grammar-rule-title">{rule.title}</p>
            </div>
            <div className="grammar-rule-box" style={{background:rule.bg}}>
              <p style={{color:rule.color}}>{rule.rule}</p>
            </div>
            <p className="examples-label">Examples</p>
            <div className="examples-list">
              {rule.examples.map((ex,i)=>(
                <div key={i} className={`example-item ${ex.label.includes("✓")?'correct':ex.label.includes("✗")?'wrong':'neutral'}`}>
                  <span className="example-label">{ex.label}</span>
                  <span className="example-text">{ex.text}</span>
                </div>
              ))}
            </div>
            <div className="grammar-tip">
              <BulbIc/><p><strong>Remember:</strong> {rule.tip}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function HintNudge({ wrongCount, onOpen, onDismiss }) {
  if (wrongCount===2) return (
    <div className="hint-nudge">
      <div><BulbIc/><span>Having trouble? The guide covers all the rules.</span></div>
      <div className="hint-actions">
        <button onClick={onOpen} className="hint-primary">See Guide</button>
        <button onClick={onDismiss} className="hint-secondary">Skip</button>
      </div>
    </div>
  );
  if (wrongCount>=3) return (
    <div className="hint-nudge serious">
      <div className="hint-header"><AlertIc/><span>{wrongCount} attempts — still stuck?</span></div>
      <p>The guide covers word order, a/an, and verb forms.</p>
      <button onClick={onOpen} className="hint-primary"><BookIc/> Open Guide</button>
    </div>
  );
  return null;
}

function GramWarnings({ warnings, onOpen }) {
  if (!warnings?.length) return null;
  return (
    <div className="gram-warnings">
      <div className="gram-warnings-header">
        <div><AlertIc/><span>Grammar Tips</span></div>
        <button onClick={onOpen}>Guide</button>
      </div>
      {warnings.map((w,i)=><div key={i} className="warning-item"><span>→</span><span>{w}</span></div>)}
      <p className="warning-footer">Great meaning — fix these for a perfect sentence.</p>
    </div>
  );
}

function VideoPanel({ sentence, solved, domainColor, onWatched, hasWatched }) {
  const ref=useRef(null);
  const [playing,setPlaying]=useState(false);
  const [progress,setProgress]=useState(0);
  useEffect(()=>{setPlaying(false);setProgress(0);if(ref.current){ref.current.pause();ref.current.currentTime=0;}},[sentence.id]);
  useEffect(()=>{const t=setTimeout(()=>{ref.current?.play().then(()=>setPlaying(true)).catch(()=>{});},400);return()=>clearTimeout(t);},[sentence.id]);
  function toggle(){if(!ref.current)return;ref.current.paused?(ref.current.play(),setPlaying(true)):(ref.current.pause(),setPlaying(false));}
  function onTime(){if(!ref.current?.duration)return;const p=ref.current.currentTime/ref.current.duration;setProgress(p*100);if(p>0.8&&!hasWatched)onWatched();}
  return (
    <div className="video-panel">
      <div className="video-container">
        <img src={sentence.poster} alt="" className="video-poster"/>
        <video ref={ref} src={sentence.videoUrl} className={`video-player ${playing?'playing':''}`} onTimeUpdate={onTime} onEnded={()=>{setPlaying(false);onWatched();}} playsInline/>
        <button onClick={toggle} className="video-play-button">
          {!playing&&<div className="play-icon"><PlayIc/></div>}
        </button>
        {hasWatched&&!solved&&<div className="video-badge watched">▶ WATCHED</div>}
        {solved&&<div className="video-badge correct"><Chk s={9}/> CORRECT</div>}
        {!hasWatched&&!playing&&<div className="video-hint"><div>Watch first, then describe</div></div>}
      </div>
      <div className="progress-bar"><div style={{width:`${progress}%`,background:domainColor}}/></div>
      <div className="video-note">
        <p className="note-label">Usage Note</p>
        <p className={`note-text ${solved ? 'visible' : ''}`}>{solved?sentence.note:"Complete the sentence to reveal."}</p>
      </div>
    </div>
  );
}

function ImagePanel({ sentence, solved }) {
  const [loaded,setLoaded]=useState(false);
  useEffect(()=>setLoaded(false),[sentence.id]);
  return (
    <div className="image-panel">
      <div className="image-container">
        <img src={sentence.imageUrl} alt="" className="image-blur"/>
        <img src={sentence.imageUrl} alt="Describe this" onLoad={()=>setLoaded(true)} className={`image-main ${loaded?'loaded':''}`}/>
        <div className="image-badge"><ImgIc sz={10}/> IMAGE</div>
        {solved&&<div className="image-solved-badge"><Chk s={9}/> CORRECT</div>}
        {!solved&&<div className="image-hint"><div>Describe what you see</div></div>}
      </div>
      <div className="image-note">
        <p className="note-label">Usage Note</p>
        <p className={`note-text ${solved ? 'visible' : ''}`}>{solved?sentence.note:"Complete the sentence to reveal."}</p>
      </div>
    </div>
  );
}

function MediaTypeScreen({ domain, onSelect, onBack }) {
  const [hov,setHov]=useState(null);
  const vc=domain.sentences.filter(s=>s.mediaType==="video").length;
  const ic=domain.sentences.filter(s=>s.mediaType==="image").length;
  const opts=[
    {type:"video",icon:<VidIc/>,label:"Video Mode",desc:"Watch clips and describe the action.",eg:'"The nurse gives the patient an injection"',accent:"#1d4ed8",bg:"#eff6ff",border:"#bfdbfe",count:vc},
    {type:"image",icon:<ImgIc/>,label:"Image Mode",desc:"Study photos and describe what you observe.",eg:'"The gavel is on the desk"',accent:"#0f766e",bg:"#f0fdfa",border:"#99f6e4",count:ic},
  ];
  return (
    <div className="mediatype-screen">
      <header className="mediatype-header">
        <div className="mediatype-nav">
          <button onClick={onBack} className="back-button">
            <ArrowL/> Domains
          </button>
          <div className="divider"/>
          <div className="domain-badge">
            <div className="domain-icon" style={{background:domain.bg,borderColor:domain.border}}>{domain.icon}</div>
            <span className="domain-label">{domain.label}</span>
          </div>
        </div>
        <span className="logo">learnsphere</span>
      </header>
      <div className="mediatype-content">
        <div className="mediatype-header-text">
          <div className="domain-chip" style={{background:domain.bg,borderColor:domain.border}}>
            <span>{domain.icon}</span><span style={{color:domain.color}}>{domain.label}</span>
          </div>
          <h1>How would you like to learn?</h1>
          <p>Videos are best for action verbs. Images work better for describing states.</p>
        </div>
        <div className="mode-cards">
          {opts.map(opt=>{
            const h=hov===opt.type;
            return (
              <button key={opt.type} onMouseEnter={()=>setHov(opt.type)} onMouseLeave={()=>setHov(null)} onClick={()=>onSelect(opt.type)}
                className={`mode-card ${h?'hover':''}`} style={{background:h?opt.bg:"#fff",borderColor:h?opt.accent:"rgba(77,166,255,0.2)"}}>
                <div className="mode-icon" style={{background:h?"linear-gradient(135deg,#4da6ff,#0073e6)":"rgba(77,166,255,0.08)",color:h?"#fff":"#4a6fa5"}}>{opt.icon}</div>
                <div className="mode-header">
                  <p className="mode-title" style={{color:h?opt.accent:"#1a3b5d"}}>{opt.label}</p>
                  <span className="mode-count" style={{background:h?"linear-gradient(135deg,#4da6ff,#0073e6)":"rgba(77,166,255,0.1)",color:h?"#fff":"#4a6fa5"}}>{opt.count} cards</span>
                </div>
                <p className="mode-desc">{opt.desc}</p>
                <div className="mode-example" style={{borderLeftColor:h?opt.accent:"rgba(77,166,255,0.2)"}}>
                  <p>e.g. {opt.eg}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function DomainScreen({ onSelect, recentCustom, totalStars, onBack }) {
  const [query,setQuery]=useState("");
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState("");
  const [hov,setHov]=useState(null);
  const [pop,setPop]=useState(false);
  const prev=useRef(totalStars);
  useEffect(()=>{if(totalStars>prev.current){setPop(true);setTimeout(()=>setPop(false),600);}prev.current=totalStars;},[totalStars]);
  const filtered=query.trim()?DOMAINS.filter(d=>d.label.toLowerCase().includes(query.toLowerCase())||d.description.toLowerCase().includes(query.toLowerCase())):DOMAINS;
  const showGen=query.trim().length>1&&filtered.length===0;
  const showGenHint=query.trim().length>1&&filtered.length>0&&!DOMAINS.some(d=>d.label.toLowerCase()===query.trim().toLowerCase());
  async function gen(){if(!query.trim()||loading)return;setLoading(true);setError("");try{const d=await generateDomain(query.trim());onSelect(d);}catch{setError("Couldn't generate. Try a different search.");}finally{setLoading(false);}}
  return (
    <div className="domain-screen">
      <header className="domain-header">
        <div className="domain-nav-left">
          <button onClick={onBack} className="back-button">
            <ArrowL/> Back to Levels
          </button>
        </div>
        <div className="domain-header-actions">
          {totalStars>0&&<StarCounter count={totalStars} pop={pop}/>}
        </div>
      </header>
      <div className="domain-main">
        <div className="domain-main-header">
          <p className="domain-breadcrumb">Sentence Composition</p>
          <h1>Choose your learning domain</h1>
          <p className="domain-description">Earn ⭐ stars by solving sentences — stars automatically unlock the next card</p>
        </div>
        <div className="search-container">
          <div className="search-box">
            <SearchIc/>
            <input value={query} onChange={e=>{setQuery(e.target.value);setError("");}} onKeyDown={e=>e.key==="Enter"&&query.trim().length>1&&gen()} placeholder="Search or generate any domain"/>
            {query.length>0&&<button onClick={()=>{setQuery("");setError("");}} className="clear-search">×</button>}
          </div>
          {showGenHint&&<div className="generate-hint">
            <span>Don't see <strong>{query}</strong>?</span>
            <button onClick={gen} disabled={loading} className="generate-button">
              {loading?<><Spn/> Generating…</>:"Generate with AI"}
            </button>
          </div>}
          {error&&<p className="error-message">{error}</p>}
        </div>
        <div className="domains-grid-container">
          <p className="domains-label">{query.trim()?`Results for "${query}"`:"Curated Domains"}</p>
          {filtered.length>0?(
            <div className="domains-grid">
              {filtered.map(d=>{
                const h=hov===d.id;
                return (
                  <button key={d.id} onMouseEnter={()=>setHov(d.id)} onMouseLeave={()=>setHov(null)} onClick={()=>onSelect(d)}
                    className={`domain-card ${h?'hover':''}`} style={{background:h?d.bg:"#fff",borderColor:h?d.border:"rgba(77,166,255,0.15)"}}>
                    <div className="domain-card-icon" style={{background:h?d.color:"rgba(77,166,255,0.08)"}}>{d.icon}</div>
                    <div>
                      <p className="domain-card-title" style={{color:h?d.color:"#1a3b5d"}}>{d.label}</p>
                      <p className="domain-card-count">{d.sentences.length} sentences</p>
                    </div>
                  </button>
                );
              })}
            </div>
          ):showGen?(
            <div className="generate-empty">
              <div className="generate-icon">✦</div>
              <div>
                <p>Generate "<em>{query}</em>"</p>
                <p>We'll create sentences using AI.</p>
              </div>
              <button onClick={gen} disabled={loading} className="generate-primary">
                {loading?<><Spn/> Generating…</>:"Generate Domain"}
              </button>
            </div>
          ):null}
          {recentCustom.length>0&&!query.trim()&&(
            <div className="recent-domains">
              <p className="recent-label">Recently Generated</p>
              <div className="recent-list">
                {recentCustom.map(d=>(
                  <button key={d.id} onClick={()=>onSelect(d)} className="recent-chip">
                    <span>{d.icon}</span>{d.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PuzzlePanel({ domain, sentence, sentIdx, totalInMode, solved, setSolved, onBack, onStarEarned, totalStars, onNext }) {
  const [bank,setBank]=useState([]);
  const [comp,setComp]=useState([]);
  const [dragSrc,setDragSrc]=useState(null);
  const [dropHov,setDropHov]=useState(null);
  const [wrongAttempt,setWrongAttempt]=useState(false);
  const [shakeKey,setShakeKey]=useState(0);
  const [watched,setWatched]=useState(false);
  const [checking,setChecking]=useState(false);
  const [aiFb,setAiFb]=useState(null);
  const [wrongCount,setWrongCount]=useState(0);
  const [burst,setBurst]=useState(false);
  const [warnings,setWarnings]=useState([]);
  const [guide,setGuide]=useState(false);
  const [hintOff,setHintOff]=useState(false);

  const isSolved=solved.has(sentence.id);
  const isImg=sentence.mediaType==="image";
  const unlocked=isImg||watched;

  useEffect(()=>{
    setBank(buildBank(sentence.coreWords,sentence.extraWords));
    setComp([]);setWrongAttempt(false);setWatched(false);
    setChecking(false);setAiFb(null);setWrongCount(0);
    setWarnings([]);setHintOff(false);
  },[sentence.id]);

  const reset=()=>{setBank(buildBank(sentence.coreWords,sentence.extraWords));setComp([]);setWrongAttempt(false);setAiFb(null);};
  const toComp=(item,at)=>{if(isSolved||!unlocked)return;setBank(p=>p.filter(i=>i.id!==item.id));setComp(p=>{const n=[...p];n.splice(at??n.length,0,item);return n;});setWrongAttempt(false);setAiFb(null);};
  const toBank=(item)=>{if(isSolved)return;setComp(p=>p.filter(i=>i.id!==item.id));setBank(p=>[...p,item]);setWrongAttempt(false);setAiFb(null);};
  const reorder=(from,to)=>{if(from===to)return;setComp(p=>{const n=[...p];const[x]=n.splice(from,1);n.splice(to,0,x);return n;});};
  const onDropComp=(e,idx)=>{e.preventDefault();if(!dragSrc||isSolved)return;if(dragSrc.zone==="bank"){const item=bank.find(i=>i.id===dragSrc.id);if(item)toComp(item,idx);}else reorder(dragSrc.idx,idx??comp.length);setDragSrc(null);setDropHov(null);};
  const onDropBank=(e)=>{e.preventDefault();if(!dragSrc||isSolved)return;if(dragSrc.zone==="comp"){const item=comp.find(i=>i.id===dragSrc.id);if(item)toBank(item);}setDragSrc(null);};

  async function check(){
    if(comp.length<2){setShakeKey(k=>k+1);return;}
    setChecking(true);
    const res=await evaluate(comp.map(i=>i.w).join(" "),sentence);
    setChecking(false);
    if(res.correct){
      setSolved(s=>new Set([...s,sentence.id]));
      setWarnings(res.warnings||[]);
      setBurst(true);
      onStarEarned(sentence.id);
    }else{
      setShakeKey(k=>k+1);setWrongAttempt(true);
      setWrongCount(c=>c+1);setAiFb(res.fb||"Not quite — try rearranging.");setHintOff(false);
    }
  }

  const showHint=wrongCount>=2&&!hintOff&&!isSolved;

  return (
    <div className="puzzle-screen">
      {burst&&<StarBurst onDone={()=>setBurst(false)}/>}
      {guide&&<GrammarGuide onClose={()=>setGuide(false)}/>}

      <header className="puzzle-header">
        <div className="puzzle-nav">
          <button onClick={onBack} className="back-button">
            <ArrowL/> Cards
          </button>
          <div className="divider"/>
          <div className="domain-badge">
            <div className="domain-icon" style={{background:domain.bg,borderColor:domain.border}}>{domain.icon}</div>
            <span className="domain-label">{domain.label}</span>
            <span className="card-position">· Card {sentIdx+1}/{totalInMode}</span>
          </div>
        </div>
        <div className="puzzle-actions">
          <button onClick={()=>setGuide(true)} className="guide-button"><BookIc/> Guide</button>
          <StarCounter count={totalStars}/>
        </div>
      </header>

      <div className="puzzle-main">
        <div className="puzzle-container">
          <div className="puzzle-left">
            <div className="puzzle-info">
              <div className="puzzle-chip" style={{background:domain.bg,borderColor:domain.border}}>
                <span style={{background:domain.color,color:"#fff"}}>{sentIdx+1}/{totalInMode}</span>
                <span style={{color:domain.color}}>{domain.label}</span>
              </div>
              <h2>
                {isSolved?"Well done! 🎉":isImg?"Describe the image":!watched?"Watch the video first":"Now build your sentence"}
              </h2>
              <p>
                {isSolved?"Your sentence correctly describes what you saw."
                  :isImg?`Use the word bank. ${sentence.extraWords.length} extra word${sentence.extraWords.length!==1?"s":""} included — not all belong.`
                  :!watched?"Watch the video on the right to unlock the word bank."
                  :`Describe what you saw. ${sentence.extraWords.length} extra word${sentence.extraWords.length!==1?"s":""} included.`}
              </p>
            </div>

            <div className="sentence-area">
              <label className="sentence-label">Your Sentence</label>
              <div key={`drop-${shakeKey}`} onDragOver={e=>e.preventDefault()} onDrop={e=>onDropComp(e,comp.length)}
                className={`sentence-dropzone ${wrongAttempt?'error':isSolved?'success':!unlocked?'locked':''}`}>
                {comp.length===0&&<span className="placeholder">{!unlocked?"Watch the video first…":"Tap a word or drag it here…"}</span>}
                {comp.map((item,i)=>(
                  <div key={item.id} draggable={!isSolved}
                    onDragStart={()=>setDragSrc({zone:"comp",id:item.id,idx:i})}
                    onDragEnd={()=>{setDragSrc(null);setDropHov(null);}}
                    onDragOver={e=>{e.preventDefault();e.stopPropagation();setDropHov(i);}}
                    onDrop={e=>onDropComp(e,i)}
                    onClick={()=>toBank(item)}
                    className={`word-chip ${isSolved?'solved':''} ${dropHov===i?'drop-hover':''}`}>
                    {item.w}
                  </div>
                ))}
              </div>
              <div className="feedback-area">
                {wrongAttempt&&!checking&&<p className="error-feedback">↺ {aiFb}</p>}
                {isSolved&&<p className="success-feedback"><Chk/> Correct! +1 ⭐</p>}
                {isSolved&&<GramWarnings warnings={warnings} onOpen={()=>setGuide(true)}/>}
                {showHint&&<HintNudge wrongCount={wrongCount} onOpen={()=>{setGuide(true);setHintOff(true);}} onDismiss={()=>setHintOff(true)}/>}
              </div>
            </div>

            <div className="bank-area">
              <label className="bank-label">
                Word Bank {unlocked&&!isSolved&&<span className="extra-count">· {sentence.extraWords.length} extra word{sentence.extraWords.length!==1?"s":""}</span>}
              </label>
              <div onDragOver={e=>e.preventDefault()} onDrop={onDropBank} className={`bank-dropzone ${!unlocked?'locked':''}`}>
                {bank.length===0?<span className="placeholder">All words placed</span>
                :bank.map(item=>(
                  <div key={item.id} draggable={!isSolved&&unlocked}
                    onDragStart={()=>setDragSrc({zone:"bank",id:item.id})}
                    onDragEnd={()=>setDragSrc(null)}
                    onClick={()=>toComp(item)}
                    className="bank-word">
                    {item.w}
                  </div>
                ))}
              </div>
            </div>

            <div className="action-buttons">
              {!isSolved?(
                <button onClick={check} disabled={comp.length===0||checking||!unlocked}
                  className={`check-button ${(comp.length===0||!unlocked)?'disabled':'primary'}`}>
                  {checking?<><Spn/> Checking…</>:!unlocked?"Watch the video first":"Check Answer"}
                </button>
              ):(
                <button onClick={onNext} className="next-button">
                  {sentIdx<totalInMode-1?<>Next Card <ArrowR/></>:"Back to Cards"}
                </button>
              )}
              <button onClick={reset} className="reset-button">
                <ResetIc/>
              </button>
            </div>
          </div>

          {isImg?<ImagePanel sentence={sentence} solved={isSolved}/>:<VideoPanel sentence={sentence} solved={isSolved} domainColor={domain.color} hasWatched={watched} onWatched={()=>setWatched(true)}/>}
        </div>
      </div>
    </div>
  );
}

export default function SentenceComposition({ level, onBack }) {
  const [screen,setScreen]=useState("domain");
  const [domain,setDomain]=useState(null);
  const [mediaMode,setMediaMode]=useState(null);
  const [cardIdx,setCardIdx]=useState(0);
  const [solved,setSolved]=useState(new Set());
  const [recentCustom,setRecentCustom]=useState([]);
  const [totalStars,setTotalStars]=useState(0);
  const [newlyUnlocked,setNewlyUnlocked]=useState(new Set());
  const [flipSentence,setFlipSentence]=useState(null);

  const filteredSentences=domain?domain.sentences.filter(s=>s.mediaType===mediaMode):[];

  function selectDomain(d){
    if(d.isCustom)setRecentCustom(prev=>[d,...prev.filter(x=>x.label!==d.label)].slice(0,5));
    setDomain(d);setScreen("mediatype");
  }
  function selectMedia(type){setMediaMode(type);setScreen("cardmap");}
  function selectCard(idx){setCardIdx(idx);setScreen("puzzle");}

  function handleStarEarned(solvedSentenceId){
    const newTotal=totalStars+1;
    setTotalStars(newTotal);
    const newUnlocks=new Set();
    filteredSentences.forEach((s,idx)=>{
      const thresh=UNLOCK_THRESHOLDS[idx]||0;
      if(thresh>0&&totalStars<thresh&&newTotal>=thresh&&!solved.has(s.id)){
        newUnlocks.add(s.id);
      }
    });
    if(newUnlocks.size>0){
      const firstNew=filteredSentences.find(s=>newUnlocks.has(s.id));
      if(firstNew)setFlipSentence(firstNew);
      setNewlyUnlocked(prev=>new Set([...prev,...newUnlocks]));
      setTimeout(()=>setNewlyUnlocked(prev=>{const n=new Set(prev);newUnlocks.forEach(id=>n.delete(id));return n;}),30000);
    }
  }

  function handleNext(){
    const next=cardIdx+1;
    if(next<filteredSentences.length){
      const thresh=UNLOCK_THRESHOLDS[next]||0;
      if(totalStars>=thresh){setCardIdx(next);}
      else{setScreen("cardmap");}
    }else{
      setScreen("cardmap");
    }
  }

  return (
    <>
      {flipSentence&&<CardFlipOverlay sentence={flipSentence} onDone={()=>setFlipSentence(null)}/>}
      {screen==="domain"&&<DomainScreen onSelect={selectDomain} recentCustom={recentCustom} totalStars={totalStars} onBack={onBack}/>}
      {screen==="mediatype"&&domain&&<MediaTypeScreen domain={domain} onSelect={selectMedia} onBack={()=>{setScreen("domain");setDomain(null);setMediaMode(null);}}/>}
      {screen==="cardmap"&&domain&&mediaMode&&<CardMapScreen domain={domain} mediaMode={mediaMode} sentences={filteredSentences} solved={solved} totalStars={totalStars} newlyUnlocked={newlyUnlocked} onSelectCard={selectCard} onBack={()=>{setScreen("domain");setDomain(null);setMediaMode(null);}}/>}
      {screen==="puzzle"&&domain&&mediaMode&&filteredSentences[cardIdx]&&<PuzzlePanel domain={domain} sentence={filteredSentences[cardIdx]} sentIdx={cardIdx} totalInMode={filteredSentences.length} solved={solved} setSolved={setSolved} onBack={()=>setScreen("cardmap")} onStarEarned={handleStarEarned} totalStars={totalStars} onNext={handleNext}/>}
    </>
  );
}