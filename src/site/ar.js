/* v40: Arabic. One translation layer over the whole front page: every text node is looked up (exact phrase, then
   patterns for dates, counts and visits) and swapped in place, the English kept to swap back; anything the page writes
   later is caught by an observer. Arabic is Claude's draft for Suhail to correct.
   The switch itself: the English dissolves, the page turns to face the other way (each piece glides to its mirrored
   place), then a reed pen crosses the page right to left and the Arabic is inked in behind it.
   v41: the Work page too, its live mocks included; placeholders ([N] etc.) are translated as whole sentences. */
const AR = (() => {
  const DIG = "٠١٢٣٤٥٦٧٨٩", dg = (s) => String(s).replace(/\d/g, (d) => DIG[d]);
  const MON = { Jan: "يناير", Feb: "فبراير", Mar: "مارس", Apr: "أبريل", May: "مايو", Jun: "يونيو", Jul: "يوليو", Aug: "أغسطس", Sep: "سبتمبر", Oct: "أكتوبر", Nov: "نوفمبر", Dec: "ديسمبر" };
  // Arabic counting: one, two, three to ten, eleven and up
  const cnt = (n, [one, two, few, many]) => (n = +n, n === 1 ? one : n === 2 ? two : n <= 10 ? `${dg(n)} ${few}` : `${dg(n)} ${many}`);
  const N = {
    book: ["كتاب واحد", "كتابان", "كتب", "كتاباً"], album: ["ألبوم واحد", "ألبومان", "ألبومات", "ألبوماً"],
    night: ["ليلة", "ليلتين", "ليالٍ", "ليلة"], week: ["أسبوع", "أسبوعين", "أسابيع", "أسبوعاً"], month: ["شهر", "شهرين", "أشهر", "شهراً"],
    year: ["سنة", "سنتين", "سنوات", "سنة"], min: ["دقيقة", "دقيقتان", "دقائق", "دقيقة"], star: ["نجمة واحدة", "نجمتان", "نجوم", "نجمة"],
    row: ["صف واحد", "صفان", "صفوف", "صفاً"], source: ["مصدر واحد", "مصدران", "مصادر", "مصدراً"], thought: ["خاطرة واحدة", "خاطرتان", "خواطر", "خاطرة"], essay: ["مقالة واحدة", "مقالتان", "مقالات", "مقالة"], note: ["ملاحظة واحدة", "ملاحظتان", "ملاحظات", "ملاحظة"], sheet: ["جدول واحد", "جدولان", "جداول", "جدولاً"],
  };
  const date = (s) => s.replace(/^(\d{1,2}) (\w{3}) (\d{4})$/, (m, d, mo, y) => `${dg(d)} ${MON[mo] || mo} ${dg(y)}`);
  const time = (s) => s.replace(/^(\d{1,2}):(\d{2}) ?(AM|PM)$/, (m, h, mi, ap) => `${dg(h)}:${dg(mi)} ${ap === "AM" ? "ص" : "م"}`);
  const MONF = { January: "يناير", February: "فبراير", March: "مارس", April: "أبريل", May: "مايو", June: "يونيو", July: "يوليو", August: "أغسطس", September: "سبتمبر", October: "أكتوبر", November: "نوفمبر", December: "ديسمبر" };
  const DAY = { Mon: "الاثنين", Tue: "الثلاثاء", Wed: "الأربعاء", Thu: "الخميس", Fri: "الجمعة", Sat: "السبت", Sun: "الأحد" };
  const ORD = ["", "الأولى", "الثانية", "الثالثة", "الرابعة", "الخامسة", "السادسة", "السابعة", "الثامنة", "التاسعة", "العاشرة", "الحادية عشرة", "الثانية عشرة"];
  const WHO = {
    "Malcolm Gladwell": "مالكوم غلادويل", "Mitch Albom": "ميتش ألبوم", "Richard Dawkins": "ريتشارد دوكينز", "George Orwell": "جورج أورويل",
    "Coldplay": "كولدبلاي", "FINNEAS": "فينياس", "Billie Eilish": "بيلي آيليش",
  };
  const TITLE = { "The Tipping Point": "نقطة التحوّل", "Tuesdays with Morrie": "أيام الثلاثاء مع موري", "The God Delusion": "وهم الإله", "Animal Farm": "مزرعة الحيوان", "1984": "١٩٨٤" };
  const who = (s) => WHO[s] || s, title = (s) => TITLE[s] || s;
  const ago = (s) => {
    if (s === "now") return "الآن"; if (s === "earlier today") return "في وقت سابق اليوم"; if (s === "yesterday") return "أمس"; if (s === "date not kept") return "تاريخ غير محفوظ";
    let m = s.match(/^(\d+) (night|week|month|year)s? ago$/); if (m) return "قبل " + cnt(m[1], N[m[2]]);
    m = s.match(/^over a year ago$/); if (m) return "قبل أكثر من سنة";
    return null;
  };
  const kind = (k) => ({ Essay: "مقالة", Note: "ملاحظة" })[k] || k;
  const D = new Map(Object.entries({
    "Suhail AbuOsba": "سهيل ابواصبع", "By day · the work": "العمل نهاراً", "عربي": "English", "By day": "نهاراً", "The work →": "العمل ←",
    "Thoughts": "خواطر", "All →": "الكل ←", "On the shelf": "على الرف", "All thoughts →": "كل الخواطر ←", "The shelf →": "الرف ←", "Say hello": "تواصل",
    "Why this colour?": "لماذا هذا اللون؟", "Latest": "الأحدث", "Welcome back.": "أهلاً بعودتك.",
    "Good morning.": "صباح الخير.", "Good afternoon.": "طاب يومك.", "Good evening.": "مساء الخير.", "Hello, night owl.": "أهلاً يا ساهر الليل.",
    "Your first star here · it stays for next time": "أول نجمة لك هنا · تبقى للمرة القادمة", "Preview:": "معاينة:", "first visit": "الزيارة الأولى",
    "4th visit": "الزيارة الرابعة", "12th visit": "الزيارة الثانية عشرة", "yours": "زياراتك", "Point at a star": "أشِر إلى نجمة", "Tap a star": "المس نجمة",
    "Reading now": "أقرؤه الآن", "Pick another": "اختر غيره", "Tap another": "المس غيره", "Read": "قرأته", "Reading": "أقرؤه", "more": "أخرى",
    "How little things can make a big difference": "كيف يمكن للأشياء الصغيرة أن تُحدث فرقاً كبيراً",
    "An old man, a young man, and life's greatest lesson": "رجلٌ عجوز، وشابّ، ودرس الحياة الأعظم", "A fairy story": "حكاية خرافية",
    "← Tonight": "الليلة →", "The shelf": "الرف", "Books": "كتب", "Music": "موسيقى", "Next": "التالي",
    "Everything read and played, newest first.": "كل ما قرأته واستمعت إليه، الأحدث أولاً.", "Written after dark. A new one when there is one.": "تُكتب بعد حلول الظلام. جديدةٌ متى وُجدت.",
    "[draft]": "[مسودة]", "[The rest of the note, from the vault.]": "[بقية الخاطرة، من الخزانة.]", "[1 new thought]": "[خاطرة جديدة واحدة]",
    "The colour of your sky": "لون سمائك", "Drag along your day": "اسحب على امتداد يومك",
    "Your visits, as a constellation": "زياراتك، على هيئة كوكبة", "Your constellation, one star for each visit": "كوكبتك، نجمة لكل زيارة", "The whole shelf": "الرف كله",
    "Your day, midnight to midnight": "يومك، من منتصف الليل إلى منتصف الليل", "More": "المزيد", "Reading view": "القراءة", "Another": "قولٌ آخر",
    "Close": "إغلاق", "The night": "الليل",
    // v42: the inner pages
    "Pages": "الصفحات", "About": "عنّي", "Not found": "غير موجودة", "Read it →": "اقرأها ←", "Before": "السابق", "More thoughts": "خواطر أخرى",
    "Listening now": "أستمع إليه الآن", "[Month Year]": "[الشهر والسنة]", "Named for a star.": "يحمل اسم نجم.",
    "Me": "أنا", "The name": "الاسم", "The mark": "الشعار", "Now": "الآن", "Elsewhere": "في أماكن أخرى", "Listening": "أستمع", "Writing": "أكتب", "Online": "على الإنترنت",
    "See the work": "اطّلع على العمل", "Automations, APIs, data pipelines and dashboards for universities.": "أتمتة وواجهات برمجية وخطوط بيانات ولوحات متابعة للجامعات.",
    "Suhail is the Arabic name for Canopus, the second-brightest star in the night sky. In Yemen its first rising before dawn is read as the turn of the season.":
      "سهيل هو الاسم العربي للنجم الذي يُسمّى بالإنجليزية Canopus، ثاني ألمع نجوم السماء ليلاً. وفي اليمن يُقرأ طلوعه الأول قبل الفجر إيذاناً بتحوّل الموسم.",
    "An astrolabe, the old instrument for reading the sky. The letters of سهيل form its rete, the turning star map on top.":
      "أسطرلاب، الآلة القديمة لقراءة السماء. حروف «سهيل» تشكّل عنكبوته، خريطة النجوم الدوّارة في أعلاه.",
    "[Two or three lines in your own words: where you are from, what you do by day, what keeps you up at night.]": "[سطران أو ثلاثة بكلماتك: من أين أنت، وماذا تعمل نهاراً، وما الذي يُبقيك مستيقظاً ليلاً.]",
    "[link to your CV]": "[رابط سيرتك الذاتية]", "[GitHub, LinkedIn, or nothing]": "[GitHub أو LinkedIn أو لا شيء]",
    "Set in Alegreya and Noto Naskh Arabic. The page takes the colour of your sky.": "بخطَّي Alegreya وNoto Naskh Arabic. تأخذ الصفحة لون سمائك.",
    "This page isn't on the map.": "هذه الصفحة ليست على الخريطة.", "The link may be old, or the page has moved.": "ربما الرابط قديم، أو انتقلت الصفحة.",
    "You asked for": "العنوان المطلوب:", "These are all still here:": "وهذه كلها ما زالت هنا:", "Tonight": "الليلة", "The work": "العمل",
    "Visit 1 · new here": "الزيارة ١ · جديدٌ هنا", "Make yourself at home. This star is yours; it will still be here next time.": "البيت بيتك. هذه النجمة لك؛ ستبقى هنا في المرة القادمة.",
    "Make yourself at home. This star is yours.": "البيت بيتك. هذه النجمة لك.",
    // v41: the Work page
    "Work": "العمل", "Suhail AbuOsba, Work": "سهيل ابواصبع، العمل", "Back to the night": "العودة إلى الليل", "Email": "البريد", "CV": "السيرة الذاتية",
    "Automations, APIs, data pipelines and dashboards": "أتمتة وواجهات برمجية وخطوط بيانات ولوحات متابعة", "for universities.": "للجامعات.",
    "Selected builds": "مشاريع مختارة", "Builds": "المشاريع", "Live preview of the build": "معاينة حية للمشروع", "Previous build": "المشروع السابق", "Next build": "المشروع التالي",
    "Live mock": "نموذج حي", "· sample data": "· بيانات تجريبية", "Open the case study ↗": "افتح دراسة الحالة ↖", "← → to browse": "← → للتصفح",
    "Read the case study": "اقرأ دراسة الحالة", "→": "←", "←": "→", "Case study": "دراسة حالة", "· case study": "· دراسة حالة", "All builds": "كل المشاريع",
    "Student arrivals": "وصول الطلاب", "Engagement hub": "مركز المشاركة", "Events platform": "منصة الفعاليات",
    "Arrivals": "الوصول", "· check-in desk": "· مكتب التسجيل", "· ask anything": "· اسأل أي شيء", "Events": "الفعاليات",
    "Role": "الدور", "When": "متى", "Built with": "التقنيات", "Status": "الحالة", "Still running": "ما زال يعمل",
    "[Lead developer]": "[مطوّر رئيسي]", "[Year]": "[السنة]", "[Stack]": "[التقنيات]", "[N]": "[العدد]",
    "A check-in system that got [N] students through arrival during COVID, and was reused by [body] for quarantine.":
      "نظام تسجيل وصولٍ استقبل [العدد] طالباً خلال جائحة كورونا، وأعادت [الجهة] استخدامه للحجر الصحي.",
    "[N] separate team spreadsheets, folded into one place anyone can ask a question of.": "[العدد] جداول منفصلة لفرقٍ مختلفة، جُمعت في مكانٍ واحد يستطيع أيّ أحد أن يسأله.",
    "Every campus event in one app, with the reporting built in rather than bolted on.": "كل فعاليات الحرم الجامعي في تطبيقٍ واحد، والتقارير جزءٌ منه لا إضافةٌ عليه.",
    "Every dot is a student checked in. [Real numbers to come.]": "كل نقطة طالبٌ سُجّل وصوله. [الأرقام الحقيقية لاحقاً.]",
    "Many sheets in, one answer out.": "جداول كثيرة تدخل، وجوابٌ واحد يخرج.", "Events a month. [Real numbers to come.]": "الفعاليات في الشهر. [الأرقام الحقيقية لاحقاً.]",
    "The problem": "المشكلة", "What I built": "ما بنيته", "What changed": "ما الذي تغيّر",
    "[Two or three sentences on what was broken or missing, and who it hurt.]": "[جملتان أو ثلاث عمّا كان معطّلاً أو ناقصاً، ومن تضرّر منه.]",
    "[What it does, in plain words. One sentence on the part you're proudest of.]": "[ماذا يفعل، بكلماتٍ بسيطة. وجملة عن الجزء الذي تفخر به أكثر.]",
    "[The result in numbers, and who still uses it.]": "[النتيجة بالأرقام، ومن ما زال يستخدمه.]",
    // the arrivals desk
    "Checked in today": "سُجّلوا اليوم", "of [N] expected": "من أصل [العدد] متوقَّعين", "At the desk": "عند المكتب", "Hall B · desk 2 open": "القاعة ب · المكتب ٢ مفتوح",
    "Quarantine": "الحجر الصحي", "14-day, flagged on arrival": "١٤ يوماً، يُحدَّد عند الوصول", "Arriving now": "يصلون الآن", "scan · confirm · room": "مسح · تأكيد · غرفة",
    "Flights today": "رحلات اليوم", "checked in": "سُجّلوا", "Rooms assigned": "الغرف المخصّصة", "block C": "المبنى ج",
    "At desk": "عند المكتب", "Landed": "وصل", "Checked in": "سُجّل", "En route": "في الطريق", "Scheduled": "مجدولة", "Q · 14 d": "حجر · ١٤ ي",
    "Medicine": "الطب", "Engineering": "الهندسة", "Pharmacy": "الصيدلة", "Business": "إدارة الأعمال", "Law": "القانون", "Sciences": "العلوم",
    "Dentistry": "طب الأسنان", "Computing": "الحوسبة", "Architecture": "العمارة", "Nursing": "التمريض",
    // the engagement hub
    "Ask across every team's sheet…": "اسأل جداول كل الفرق دفعةً واحدة…", "Ask ↵": "اسأل ↵", "All teams · one table": "كل الفرق · جدول واحد",
    "waiting for sheets": "بانتظار الجداول", "Student": "الطالب", "Team": "الفريق", "Activity": "النشاط", "Date": "التاريخ", "Answer": "الجواب",
    "One question, asked of every team's sheet at once.": "سؤالٌ واحد، يُطرح على جداول كل الفرق في آنٍ واحد.",
    "First-years reached, by team": "طلاب السنة الأولى الذين وصلنا إليهم، حسب الفريق",
    "Outreach reached the most, then Clubs. From 7 sheets, [N] rows.": "وصل فريق التواصل إلى العدد الأكبر، ثم الأندية. من ٧ جداول، و[العدد] صفاً.",
    "Which teams reached the most first-years?": "أيّ الفرق وصلت إلى أكبر عددٍ من طلاب السنة الأولى؟",
    "Outreach": "التواصل", "Clubs": "الأندية", "Volunteers": "المتطوعون", "Mentoring": "الإرشاد", "Sport": "الرياضة", "Library": "المكتبة", "Careers": "التوظيف",
    "School visit": "زيارة مدرسة", "Society fair": "معرض الجمعيات", "Beach clean": "تنظيف الشاطئ", "1:1 session": "جلسة فردية", "5-a-side": "كرة خماسية",
    "Study skills": "مهارات الدراسة", "CV clinic": "عيادة السيرة الذاتية",
    // the events calendar
    "All campus events, one calendar": "كل فعاليات الحرم، في تقويمٍ واحد", "+ New event": "+ فعالية جديدة", "builds itself": "يُكتب وحده",
    "Sign-ups": "التسجيلات", "By week": "حسب الأسبوع", "By type": "حسب النوع", "Talks": "محاضرات", "Clubs & arts": "أندية وفنون",
    "Export report": "صدّر التقرير", "Exported": "صُدِّر", "Added": "أُضيفت",
    "Research talk": "محاضرة بحثية", "Poetry evening": "أمسية شعرية", "Football final": "نهائي كرة القدم", "Careers fair": "معرض التوظيف",
    "Alumni panel": "ندوة الخريجين", "Film night": "أمسية سينمائية", "Chess league": "دوري الشطرنج", "Open lecture": "محاضرة مفتوحة",
    "Robotics club": "نادي الروبوتات", "Hackathon": "هاكاثون", "Basketball": "كرة السلة", "Debate society": "جمعية المناظرة",
    "Guest seminar": "ندوة ضيف", "Book club": "نادي الكتاب", "Run club": "نادي الجري",
    // step 2 content (2026-10-14): the builds, About and the mocks' new words
    "Arrival outreach": "متابعة الوصول",
    "Finding when every new student would arrive": "معرفة موعد وصول كل طالب جديد",
    "A tracking system and live dashboard that reached 100% of commencing international students during COVID border closures, to learn when each would arrive.": "نظام متابعة ولوحة Power BI مباشرة وصلا إلى ١٠٠٪ من الطلبة الدوليين المستجدين خلال إغلاق الحدود بسبب كوفيد، لمعرفة موعد وصول كل منهم.",
    "During COVID border closures, a university team was reaching out to commencing international students to find out exactly when each would arrive. With 40+ staff making contact, every interaction needed recording in one place, and the arrival numbers needed to be visible.": "خلال إغلاق الحدود بسبب كوفيد، كان فريق في إحدى الجامعات يتواصل مع الطلبة الدوليين المستجدين ليعرف بدقة متى سيصل كل منهم. ومع مشاركة أكثر من ٤٠ موظفًا، كان لا بدّ من تسجيل كل تفاعل في مكان واحد، ومن إظهار أعداد الوصول بوضوح.",
    "I designed an Excel-based system for tracking contact points and recording every interaction. More than 40 staff used it actively. A live Power BI dashboard showed the results.": "صممت نظامًا قائمًا على Excel لتتبّع نقاط التواصل وتسجيل كل تفاعل، واستخدمه أكثر من ٤٠ موظفًا بشكل فعلي. وإلى جانبه لوحة Power BI مباشرة تعرض النتائج.",
    "We reached 100% of commencing international students. Arrival numbers became more transparent, and quarantine planning got better. The state government used the dashboard as one of the data sources informing its quarantine planning and response.": "وصلنا إلى ١٠٠٪ من الطلبة الدوليين المستجدين. وصارت أعداد الوصول أوضح، وتحسّن التخطيط للحجر الصحي. واستخدمت حكومة الولاية اللوحة مصدرًا من مصادر البيانات التي اعتمدت عليها في تخطيطها للحجر الصحي واستجابتها.",
    "Built it, and part of the team running the project": "بنيته، وكنت ضمن الفريق الذي نفّذ المشروع",
    "2019–2020": "٢٠١٩–٢٠٢٠",
    "Retired": "متوقف",
    "Each dot fills as a student is reached.": "تمتلئ كل نقطة حين نصل إلى طالب.",
    
    "Five pipelines behind every team dashboard": "خمسة مسارات بيانات خلف كل لوحة في الفريق",
    "Five standalone data pipelines now feed every team dashboard, in place of a separate copy of the data in each report.": "خمسة مسارات بيانات مستقلة تغذّي اليوم كل لوحات الفريق، بدل أن يحمل كل تقرير نسخته الخاصة من البيانات.",
    "Student engagement data was pulled separately into each report. Queries sat inside individual Power BI files, spreadsheets and exports from several systems: the events platform, a campus check-in system, the student data warehouse, a careers platform and finance. Each report rebuilt its own copy, refreshing one meant opening its file, and numbers had to be reconciled by hand.": "كانت بيانات مشاركة الطلبة تُسحب بشكل منفصل إلى كل تقرير. فالاستعلامات مدفونة داخل ملفات Power BI متفرقة وجداول بيانات وملفات مصدّرة من عدة أنظمة: منصة الفعاليات، ونظام تسجيل الحضور في الحرم الجامعي، ومستودع بيانات الطلبة، ومنصة الإرشاد المهني، والمالية. وكان كل تقرير يعيد بناء نسخته، وتحديث أي تقرير يعني فتح ملفه، وتُطابَق الأرقام يدويًا.",
    "I built five standalone data pipelines with 20+ tables, using star schemas where they help and bridge tables for multi-value fields. Naming and cleaning are consistent, and early-warning checks flag mismatches between engagement and finance data. The pipelines feed the orientation, events and engagement, careers and finance dashboards, and orientation alone holds about 122,000 registration rows across about 20 tables.": "بنيت خمسة مسارات بيانات مستقلة (Power BI dataflows) تضم أكثر من ٢٠ جدولًا، مع مخططات نجمية حيث تفيد، وجداول وسيطة للحقول متعددة القيم. التسمية والتنظيف متسقان، وفحوصات الإنذار المبكر تكشف أي اختلاف بين بيانات المشاركة وبيانات المالية. وهذه المسارات تغذّي لوحات التهيئة والفعاليات والمشاركة والإرشاد المهني والمالية، وتضم التهيئة وحدها نحو ١٢٢٬٠٠٠ سجل تسجيل موزعة على نحو ٢٠ جدولًا.",
    "The pipelines refresh on their own, independent of any report file. One model now sits behind governance reporting, student services fee reporting and academic senate updates. Finance is reconciled against engagement data.": "تُحدَّث المسارات تلقائيًا، دون الاعتماد على أي ملف تقرير. ونموذج واحد يقف اليوم خلف تقارير الحوكمة، وتقارير رسوم خدمات الطلبة، وتحديثات مجلس الشيوخ الأكاديمي. وصارت المالية تُطابَق مع بيانات المشاركة.",
    "Designed and built it": "صممته وبنيته",
    "2021–2026": "٢٠٢١–٢٠٢٦",
    "In use": "قيد الاستخدام",
    "Many sheets fold into one model.": "أوراق كثيرة تنطوي في نموذج واحد.",
    "Event registry": "سجل الفعاليات",
    "One ID for an event, from plan to report": "رقم واحد للفعالية من التخطيط إلى التقرير",
    "An event registry and brief builder that gives each event one ID, from planning through registration, spending and reporting.": "سجل فعاليات وأداة لإعداد الملخصات تمنح كل فعالية رقمًا واحدًا، من التخطيط إلى التسجيل والإنفاق والتقارير.",
    "Event briefs lived in Word documents. They were then retyped by hand into the registration platform. Nothing tied an event to its spending or its reporting.": "كانت ملخصات الفعاليات تُكتب في مستندات Word، ثم يُعاد إدخالها يدويًا في منصة التسجيل. ولم يكن هناك ما يربط الفعالية بإنفاقها أو بتقاريرها.",
    "I built an event registry and brief builder: a Power App on SharePoint lists, with Power Automate flows. Planning starts by minting an Event ID (a region letter and a number, such as S0142) that goes on planning documents, finance requests and partner emails. The brief moves from Draft to Ready to Published, and publishing creates the registration page on the events platform through its API and keeps later edits in sync.": "بنيت سجلًا للفعاليات وأداة لإعداد الملخصات: تطبيق Power Apps على قوائم SharePoint، مع تدفقات Power Automate. يبدأ تخطيط أي فعالية بإصدار رقم تعريف لها، حرف للمنطقة ثم رقم مثل S0142، يوضع على مستندات التخطيط وطلبات المالية ورسائل الشركاء. وينتقل الملخص من مسودة إلى جاهز إلى منشور، وعند النشر تُنشأ صفحة التسجيل على منصة الفعاليات عبر واجهتها البرمجية، وتُزامَن التعديلات اللاحقة.",
    "An event now has one ID from the first plan. The same ID tags cost codes and resources, so spending reconciles back to events, and the registry feeds the Power BI dashboards. Briefs no longer need retyping into the registration platform.": "صار للفعالية رقم واحد منذ أول خطوة في التخطيط. ويوسم الرقم نفسه رموز التكلفة والموارد، فيُطابَق الإنفاق مع الفعاليات، ويغذّي السجل لوحات Power BI. ولم يعد الملخص يُعاد إدخاله يدويًا في منصة التسجيل.",
    "2026": "٢٠٢٦",
    "Phase one, second team next": "المرحلة الأولى، والفريق الثاني بعدها",
    "Events by month, each tied to an ID.": "الفعاليات بحسب الشهر، وكل واحدة مرتبطة برقمها.",
    "I grew up in Yemen and moved to Australia in 2016 for university. By day I work on data, systems and automation for a university's student engagement team. At night I build things for myself: a home server lab, home-automation dashboards, apps for tracking my flights and money, a 3D-printing setup, and this site.": "نشأت في اليمن، وانتقلت إلى أستراليا عام ٢٠١٦ للدراسة الجامعية. أعمل نهارًا على البيانات والأنظمة والأتمتة لفريق المشاركة الطلابية في إحدى الجامعات. وفي المساء أبني أشياء لنفسي: مختبر خوادم منزلي، ولوحات متابعة لأتمتة المنزل، وتطبيقات لتتبّع رحلاتي الجوية وأموالي، ومنظومة طباعة ثلاثية الأبعاد، وهذا الموقع.",
    "Data, systems and automation for a university's student engagement team: dashboards, data pipelines, Power Apps and flows.": "بيانات وأنظمة وأتمتة لفريق المشاركة الطلابية في إحدى الجامعات: لوحات متابعة، وخطوط بيانات، وتطبيقات Power Apps وتدفقات عمل.",
    "Suhail is Canopus, the second-brightest star in the night sky. Across Arabia, its rising before dawn in late summer is traditionally taken as the sign that summer's heat is breaking.": "سهيل هو نجم كانوبوس، ثاني ألمع نجم في سماء الليل. وفي أنحاء الجزيرة العربية يُعدّ طلوعه قبل الفجر في أواخر الصيف، بحسب المأثور، علامة على أن حرّ الصيف بدأ ينكسر.",
    "Dashboards, data pipelines and automation": "لوحات متابعة وخطوط بيانات وأتمتة",
    "for student engagement.": "للمشاركة الطلابية.",
    "Dashboards, data pipelines and automation for student engagement.": "لوحات متابعة وخطوط بيانات وأتمتة للمشاركة الطلابية.",
    "· contact log": "· سجل التواصل",
    "Engagement data": "بيانات المشاركة",
    "· one model": "· نموذج واحد",
    "Students reached": "طلاب تواصلنا معهم",
    "every new student, by phone or email": "كل طالب جديد، بالهاتف أو البريد",
    "Calls under way": "مكالمات جارية",
    "40+ staff logging contacts": "أكثر من ٤٠ موظفاً يسجّلون التواصل",
    "Quarantine places": "أماكن الحجر الصحي",
    "planned from confirmed dates": "مخطَّطة من المواعيد المؤكدة",
    "Contact log": "سجل التواصل",
    "call · confirm · log": "اتصال · تأكيد · تسجيل",
    "Arrivals by week": "الوصول حسب الأسبوع",
    "dates confirmed": "المواعيد المؤكدة",
    "booked": "محجوزة",
    "dates in": "وصلت المواعيد",
    "filling": "تمتلئ",
    "open": "مفتوح",
    "Confirmed": "مؤكد",
    "Filling": "يمتلئ",
    "Open": "مفتوح",
    "Calling": "جارٍ الاتصال",
    "To call": "للاتصال",
    "Date confirmed": "تأكّد الموعد",
    "Ask across every source…": "اسأل كل المصادر دفعةً واحدة…",
    "All sources · one table": "كل المصادر · جدول واحد",
    "waiting for sources": "بانتظار المصادر",
    "Outreach reached the most, then Clubs. From 7 sources, one model.": "وصل فريق التواصل إلى العدد الأكبر، ثم الأندية. من ٧ مصادر، في نموذج واحد.",
    "One question, asked of every source at once.": "سؤالٌ واحد، يُطرح على كل المصادر دفعةً واحدة.",
    "On the shelf": "على الرف",
    "Every event starts with an ID": "كل فعالية تبدأ برقم", "Latest ID": "آخر رقم",
  }));
  const look = (t) => { let o = D.get(t); if (o == null && TITLE[t]) o = TITLE[t]; if (o == null) for (const [re, f] of R) { const m = t.match(re); if (m) { o = f(...m); break; } } return o; };
  const R = [
    [/^(\d+) books? · (\d+) albums? →$/, (m, b, a) => `${cnt(b, N.book)} · ${cnt(a, N.album)} ←`],
    [/^Your constellation · visit (\d+)(?: · last here (.+))?$/, (m, n, l) => `كوكبتك · الزيارة ${dg(n)}` + (l ? ` · آخر مرة ${ago(l) || l}` : "")],
    [/^Visit (\d+)$/, (m, n) => `الزيارة ${dg(n)}`], [/^Visit (\d+), (.+)$/, (m, n, l) => `الزيارة ${dg(n)}، ${ago(l) || l}`],
    [/^(now|earlier today|yesterday|date not kept|\d+ (?:night|week|month|year)s? ago|over a year ago)$/, (m) => ago(m)],
    [/^Read · (\d{1,2} \w{3} \d{4})$/, (m, d) => `قرأته · ${date(d)}`], [/^Read · (\d{4})$/, (m, y) => `قرأته · ${dg(y)}`], [/^\d{4}$/, (m) => dg(m)], [/^\d{1,2} \w{3} \d{4}$/, (m) => date(m)],
    [/^Released (\d{4})$/, (m, y) => `صدر ${dg(y)}`], [/^Listening now · Released (\d{4})$/, (m, y) => `أستمع إليه الآن · صدر ${dg(y)}`],
    [/^(·\s*)?(Essay|Note) · (\d+) min$/, (m, dot, k, n) => `${dot ? "· " : ""}${kind(k)} · ${cnt(n, N.min)}`],
    [/^(Essay|Note) · (\d+) min read · soon$/, (m, k, n) => `${kind(k)} · قراءة ${cnt(n, N.min)} · قريباً`],
    [/^(Essay|Note) · (\d+) min read · (\d{1,2} \w{3} \d{4})$/, (m, k, n, d) => `${kind(k)} · قراءة ${cnt(n, N.min)} · ${date(d)}`],
    // the longer welcome-back line
    [/^(?:(Back again today\.|You were here yesterday\.|It's been (\d+) (night|week)s\.|It's been a while, (?:(\d+) months|over a year|(\d+) years)\.) )?Your constellation has (\d+) stars now\.(?: Since then: (\d+) new thoughts?\.)?$/,
      (m, g, k, u, mo, y, n, since) => {
        const gap = !g ? "" : /^Back/.test(g) ? "عودةٌ أخرى اليوم. " : /^You/.test(g) ? "زيارتك السابقة كانت أمس. " : k ? `مرّت ${cnt(k, N[u])}. ` : mo ? `مرّ وقتٌ طويل، ${cnt(mo, N.month)}. ` : y ? `مرّ وقتٌ طويل، ${cnt(y, N.year)}. ` : "مرّ وقتٌ طويل، أكثر من سنة. ";
        return gap + `في كوكبتك الآن ${cnt(n, N.star)}.` + (since ? " ومنذ ذلك الحين: " + (+since === 1 ? "خاطرة جديدة" : +since === 2 ? "خاطرتان جديدتان" : +since <= 10 ? `${dg(since)} خواطر جديدة` : `${dg(since)} خاطرة جديدة`) + "." : ""); }],
    // v41: the Work page
    // v42: the inner pages
    [/^Latest · (Essay|Note) · (\d+) min$/, (m, k, n) => `الأحدث · ${kind(k)} · ${cnt(n, N.min)}`],
    [/^(\d+) so far · (\d+) essays? · (\d+) notes?$/, (m, a, e, n) => `${cnt(a, N.thought)} حتى الآن · ${cnt(e, N.essay)} · ${cnt(n, N.note)}`],
    [/^, (.+)$/, (m, a) => `، ${who(a)}`],
    [/^Build (\d+)$/, (m, n) => `المشروع ${dg(n)}`], [/^of (\d+)$/, (m, n) => `من ${dg(n)}`], [/^Build (\d+) \/ (\d+)$/, (m, a, b) => `المشروع ${dg(a)} / ${dg(b)}`],
    [/^Next build · (\d+)$/, (m, n) => `المشروع التالي · ${dg(n)}`],
    [/^(\d+) rows · (\d+) sheets?$/, (m, r, n) => `${cnt(r, N.row)} · ${cnt(n, N.sheet)}`], [/^(\d+) sheets?$/, (m, n) => cnt(n, N.sheet)],
    [/^(\d+) rows · (\d+) sources?$/, (m, r, n) => `${cnt(r, N.row)} · ${cnt(n, N.source)}`], [/^(\d+) sources?$/, (m, n) => cnt(n, N.source)],
    [/^(.+) · (AR \d+)$/, (m, a, c) => `${D.get(a) || a} · ${c}`],
    [/^(.+) · Week (\d)$/, (m, a, n) => `${D.get(a) || a} · الأسبوع ${dg(n)}`], [/^Week (\d)$/, (m, n) => `الأسبوع ${dg(n)}`],
    [/^(January|February|March|April|May|June|July|August|September|October|November|December) (\d{4})$/, (m, mo, y) => `${MONF[mo]} ${dg(y)}`],
    [/^(January|February|March|April|May|June|July|August|September|October|November|December)$/, (m) => MONF[m]],
    [/^Report · (\w+)$/, (m, mo) => `تقرير ${MONF[mo] || mo}`], [/^(\w+)-report\.pdf$/i, (m, mo) => `تقرير-${MONF[mo[0].toUpperCase() + mo.slice(1)] || mo}.pdf`],
    [/^· (Mon|Tue|Wed|Thu|Fri|Sat|Sun) (\d+)$/, (m, d, n) => `· ${DAY[d]} ${dg(n)}`], [/^W(\d)$/, (m, n) => `أ${dg(n)}`],
    [/^(\d{1,2}) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)$/, (m, d, mo) => `${dg(d)} ${MON[mo]}`],
    [/^by (.+)$/, (m, a) => `لـ${who(a)}`], [/^· (.+)$/, (m, a) => `· ${look(a) || who(a)}`],
    [/^← (.+)$/, (m, a) => `→ ${look(a) || a}`], [/^(.+) →$/, (m, a) => `${look(a) || a} ←`],
    [/^\+(\d+)$/, (m, n) => `+${dg(n)}`], [/^\d+$/, (m) => dg(m)], [/^(?=.*\d)[\d\-:./ ]+$/, (m) => dg(m)],
    [/^Sunrise (.+) · Sunset (.+)$/, (m, a, b) => `الشروق ${time(a)} · الغروب ${time(b)}`], [/^\d{1,2}:\d{2} ?(AM|PM)$/, (m) => time(m)],
    // aria labels
    [/^(.+), by (.+?)(, reading now)?$/, (m, t, a, now) => `${title(t)}، لـ${who(a)}${now ? "، أقرؤه الآن" : ""}`],
    [/^(.+), album by (.+?)(, listening now)?$/, (m, t, a, now) => `${t}، ألبوم لـ${who(a)}${now ? "، أستمع إليه الآن" : ""}`],
    [/^(\d+) more (book|album)s?, see the whole shelf$/, (m, n, w) => `${cnt(n, N[w])} أخرى، اعرض الرف كله`],
  ];
  function tr(s) {
    const t = s.trim(); if (!t) return null;
    let out = look(t);
    if (out == null) return null;
    out = out.replace(/\s·\s/g, "، ").replace(/^·\s/, "، "); // a Latin middle dot reads as an Arabic zero; Arabic lists take a comma
    const r = s.replace(t, out);
    return /^،/.test(out) ? r.replace(/^\s+/, "") : r; // a comma hugs the word before it
  }

  const ROOTS = "#top, #page, .mwork, .cs-pop, #reader, #work";
  const orig = new WeakMap(), wrote = new WeakMap(), origH = new WeakMap(), wroteH = new WeakMap();
  let lang = "en", obs = null;
  const skip = (el) => !el || el.closest("svg, .drafts, [data-i18n-skip], .duo-line, script, style");
  function swapNode(n) {
    if (skip(n.parentElement) || !n.parentElement.closest(ROOTS)) return;
    if (lang === "ar") {
      if (wrote.get(n) === n.nodeValue) return;           // our own Arabic, already in place
      const en = n.nodeValue, a = tr(en);
      if (a != null && a !== en) { orig.set(n, en); n.nodeValue = a; wrote.set(n, a); }
    } else if (orig.has(n)) { if (wrote.get(n) === n.nodeValue) n.nodeValue = orig.get(n); orig.delete(n); wrote.delete(n); }
  }
  function swapAttrs(el) {
    if (skip(el)) return;
    for (const at of ["aria-label", "title"]) {
      const k = "data-en-" + at;
      if (lang === "ar") { const v = el.getAttribute(at); if (v == null || el.getAttribute("data-ar-" + at) === v) continue; const a = tr(v); if (a) { el.setAttribute(k, v); el.setAttribute(at, a); el.setAttribute("data-ar-" + at, a); } }
      else if (el.hasAttribute(k)) { el.setAttribute(at, el.getAttribute(k)); el.removeAttribute(k); el.removeAttribute("data-ar-" + at); }
    }
  }
  /* a sentence with placeholders in it (<mark>[N]</mark>) is split over several text nodes; it is translated whole,
     and the Arabic gets its placeholders marked again. Short labels whose English is ambiguous carry their Arabic (data-ar). */
  const mk = (s) => s.replace(/\[([^\]]+)\]/g, '<mark class="tbd">[$1]</mark>');
  function swapWhole(el, ar) {
    if (skip(el) || !el.closest(ROOTS)) return;
    if (lang === "ar") {
      const t = el.textContent.trim(); if (wroteH.get(el) === t) return;
      const a = ar != null ? ar : look(t); if (a == null || a === t) return;
      origH.set(el, el.innerHTML); wroteH.set(el, a.trim()); el.innerHTML = ar != null ? a : mk(a);
    } else if (origH.has(el)) { if (wroteH.get(el) === el.textContent.trim()) el.innerHTML = origH.get(el); origH.delete(el); wroteH.delete(el); }
  }
  function walk(root) {
    if (root.nodeType === 3) return swapNode(root);
    if (root.nodeType !== 1) return;
    const marks = new Set(); (root.matches("mark.tbd") ? [root] : []).concat([...root.querySelectorAll("mark.tbd")]).forEach((m) => m.parentElement && !m.parentElement.matches("mark") && marks.add(m.parentElement));
    marks.forEach((el) => swapWhole(el));
    (root.matches("[data-ar]") ? [root] : []).concat([...root.querySelectorAll("[data-ar]")]).forEach((el) => swapWhole(el, el.dataset.ar));
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT); let n; while ((n = w.nextNode())) swapNode(n);
    if (root.matches && root.matches("[aria-label],[title]")) swapAttrs(root);
    root.querySelectorAll && root.querySelectorAll("[aria-label],[title]").forEach(swapAttrs);
  }
  const all = () => document.querySelectorAll(ROOTS).forEach(walk);
  function watch() {
    obs = new MutationObserver((recs) => {
      if (lang !== "ar") return;
      for (const r of recs) {
        if (r.type === "characterData") swapNode(r.target);
        else if (r.type === "attributes") swapAttrs(r.target);
        else r.addedNodes.forEach(walk);
      }
      obs.takeRecords();
    });
    obs.observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ["aria-label", "title"] });
  }
  function setDoc(l) {
    lang = l; const h = document.documentElement; h.lang = l; h.dir = l === "ar" ? "rtl" : "ltr";
    try { localStorage.setItem("ao-lang", l); } catch (e) {}
    all(); if (obs) obs.takeRecords();
    dispatchEvent(new CustomEvent("aolang", { detail: l }));
  }

  /* ── the switch ── */
  const FLIP = "#top .who, #top .hr, .welcome h1, .duo-line, .duo-side, .blk .hd, #car .note, .dots, .sh-scene, .sh-cap, .more a, .mwork, "
    + "#reader .pill, #reader .r-nav, #reader .r-hd, #reader .th-list, #reader .th-peek, #reader .ab-mk, #reader .ab-in, #reader .r-pn, "
    + "#work .wk-brand, #work .wk-links, #work .wk-pos, #work .wk-idx, #work .wk-inf.on, #work .wk-stage, #work .wk-cbar > *, #work .wk-chead, #work .wk-chero, #work .wk-csec, #work .wk-cfig";
  const INK = "#top .nm, #top .lbl, #top a[lang], .welcome h1, .duo-line, .bk-c .meta, .blk .hd, #car .note small, #car .note h2, #car .note p, .sh-cap small, .sh-cap p, .sh-cap .why, .more a, .mwork > span, "
    + "#reader .pill, #reader .r-nav a, #reader .in h1, #reader .in .dek, #reader .in .when, #reader .in > p, #reader .r-hd p, #reader .th-row, #reader .th-peek > div, #reader .ab-mk p, #reader .ab-s, #reader .log li, #reader .sh-tabs, #reader .r-pn a, #reader .r-all, #reader .lost p, #reader .lost nav, "
    + "#work .wk-nm, #work .wk-sec, #work .wk-links > *, #work .wk-pos, #work .wk-idxh, #work .wk-tab, #work .wk-inf.on > *, #work .wk-apps, #work .wk-livet, #work .wk-facts.on > div, #work .wk-keys, "
    + "#work .wk-cbar > *, #work .wk-chead .wk-cf, #work .wk-csec, #work .wk-cfig figcaption, #work .wk-cnext";
  let busy = false;
  const vis = (el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth ? r : null; };
  function toggle() {
    if (busy) return; const to = lang === "ar" ? "en" : "ar";
    if (REDUCE || /\b(rising|setting|dusk)\b/.test(document.body.className)) return setDoc(to);
    busy = true;
    const W = innerWidth, rtl = to === "ar";
    const ink = [...new Set([...document.querySelectorAll(INK)])].filter((e) => !e.closest(".drafts") && vis(e));
    const flips = [...document.querySelectorAll(FLIP)].map((e) => [e, vis(e)]).filter(([, r]) => r);
    // 1. the English dissolves, from the end of the line it was read toward
    const outs = ink.map((e) => { const r = e.getBoundingClientRect(), cx = (r.left + r.right) / 2 / W, d = (rtl ? 1 - cx : cx) * 160;
      return e.animate([{ opacity: 1, filter: "blur(0)", transform: "none" }, { opacity: 0, filter: "blur(4px)", transform: `translateX(${rtl ? -10 : 10}px)` }], { duration: 300, delay: d, easing: "ease-in", fill: "forwards" }); });
    // the live mocks are screens, not text on the page: they dim, turn with the page, and come back already in the new language
    const screens = [...document.querySelectorAll("#work .wk-view")].filter(vis);
    const dims = screens.map((e) => e.animate([{ opacity: 1 }, { opacity: 0.08 }], { duration: 320, easing: "ease-in", fill: "forwards" }));
    const wk = document.getElementById("work"); wk && wk.classList.add("wk-hold"); // no auto-advance mid-turn
    document.documentElement.classList.add("ao-turning");
    setTimeout(() => {
      // 2. the page turns to face the other way: each piece glides to its mirrored place
      setDoc(to);
      const inkR = ink.map((e) => e.getBoundingClientRect()), flipR = flips.map(([e]) => e.getBoundingClientRect()); // measured before anything moves
      flips.forEach(([e, a], j) => { const b = flipR[j], dx = a.left - b.left, dy = a.top - b.top; if (Math.abs(dx) + Math.abs(dy) < 2) return;
        e.animate([{ translate: `${dx}px ${dy}px` }, { translate: "0 0" }], { duration: 820, easing: "cubic-bezier(.65,0,.25,1)", composite: "add" }); });
      // 3. a reed pen crosses the page in the new direction; the words are inked in behind it
      const P = 1150, T0 = document.body.classList.contains("reading") ? 300 : 640; // inner pages are all words, nothing to watch glide: the pen comes sooner
      outs.forEach((o) => o.cancel());
      dims.forEach((d) => d.cancel()); screens.forEach((e) => e.animate([{ opacity: 0.08 }, { opacity: 1 }], { duration: 700, delay: 380, easing: "ease-out", fill: "backwards" }));
      ink.forEach((e, j) => { const r = inkR[j], s = rtl ? (W - r.right) / W : r.left / W, w = Math.max(.08, r.width / W);
        e.style.setProperty("--ink-d", (T0 + s * P).toFixed(0) + "ms"); e.style.setProperty("--ink-t", (w * P + 180).toFixed(0) + "ms");
        e.classList.add("ao-ink", rtl ? "ao-rtl" : "ao-ltr"); });
      const pen = document.createElement("div"); pen.className = "ao-pen " + (rtl ? "ao-rtl" : "ao-ltr"); pen.innerHTML = "<i></i>"; document.body.appendChild(pen);
      pen.animate([{ transform: `translateX(${rtl ? W + 40 : -40}px)`, opacity: 0 }, { opacity: 1, offset: .06 }, { opacity: 1, offset: .9 }, { transform: `translateX(${rtl ? -40 : W + 40}px)`, opacity: 0 }], { duration: P + 260, delay: T0 - 60, easing: "cubic-bezier(.45,.05,.55,.95)", fill: "both" })
        .finished.then(() => pen.remove());
      setTimeout(() => { ink.forEach((e) => { e.classList.remove("ao-ink", "ao-rtl", "ao-ltr"); e.style.removeProperty("--ink-d"); e.style.removeProperty("--ink-t"); });
        document.documentElement.classList.remove("ao-turning"); wk && !wk.querySelector(".wk-stage:hover") && wk.classList.remove("wk-hold"); busy = false; }, T0 + P + 500);
    }, 420);
  }
  function init() {
    // the address decides the language (/ar/ is Arabic); the page arrives with lang and dir already set
    watch(); if (document.documentElement.lang === "ar") setDoc("ar");
    document.querySelectorAll('#top a[lang="ar"], #work a[lang="ar"], #reader a[lang="ar"]').forEach((a) => a.addEventListener("click", (e) => { e.preventDefault(); toggle(); }));
  }
  return { init, toggle, get lang() { return lang; }, tr, look };
})();
