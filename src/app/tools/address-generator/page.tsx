"use client";

import { useState, useCallback } from "react";
import { ArrowLeft, Copy, Check, RefreshCw, MapPin, Trash2 } from "lucide-react";
import MacWindow from "@/components/MacWindow";
import Link from "next/link";

/* ═══════════ COUNTRY DATA ═══════════ */
interface CountryData {
    name: string;
    code: string;
    cities: string[];
    streetPatterns: string[];
    states?: string[];
    postalFormat: string;
    phonePrefix: string;
}

// Street name pools by region
const GENERIC_STREETS = {
    en: ["Main St", "Oak Ave", "Maple Dr", "Cedar Ln", "Pine Rd", "Elm St", "Park Ave", "High St", "Church Rd", "Station Rd", "Victoria Rd", "King St", "Queen St", "Bridge St", "Mill Ln", "Hill Rd"],
    es: ["Calle Mayor", "Av. Libertad", "Calle Real", "Paseo del Prado", "Calle San Martín", "Av. de la Constitución", "Calle Bolívar", "Av. Central", "Calle Independencia", "Calle Colón"],
    fr: ["Rue de la Paix", "Avenue Victor Hugo", "Rue du Commerce", "Boulevard Saint-Michel", "Rue de la République", "Avenue des Champs", "Rue Principale", "Rue du Marché", "Rue de l'Église", "Boulevard de la Liberté"],
    de: ["Hauptstraße", "Bahnhofstraße", "Schulstraße", "Gartenstraße", "Kirchstraße", "Berliner Straße", "Waldstraße", "Ringstraße", "Parkstraße", "Bergstraße"],
    pt: ["Rua Augusta", "Av. Paulista", "Rua das Flores", "Av. Brasil", "Rua da Liberdade", "Rua do Comércio", "Av. Central", "Rua da República", "Rua São Paulo", "Av. Atlântica"],
    ar: ["شارع الملك", "شارع الجمهورية", "شارع النصر", "شارع السلام", "شارع الحرية", "طريق المطار", "شارع الأمير", "شارع الوحدة"],
    zh: ["中山路", "人民路", "解放路", "建设路", "和平路", "文化路", "胜利路", "新华路", "长安街", "南京路"],
    ja: ["桜通り", "中央通り", "駅前通り", "本町通り", "大通り", "公園通り", "銀座通り", "青山通り"],
    ko: ["강남대로", "테헤란로", "세종대로", "을지로", "종로", "삼성로", "압구정로", "도산대로"],
    id: ["Jl. Sudirman", "Jl. Thamrin", "Jl. Gatot Subroto", "Jl. Merdeka", "Jl. Ahmad Yani", "Jl. Diponegoro", "Jl. Rasuna Said", "Jl. Kartini", "Jl. Imam Bonjol", "Jl. Pahlawan"],
    ru: ["ул. Ленина", "ул. Мира", "ул. Пушкина", "Проспект Мира", "ул. Гагарина", "ул. Кирова", "ул. Советская", "Невский проспект"],
    hi: ["MG Road", "Gandhi Nagar", "Nehru Place", "Station Road", "Temple Street", "Market Road", "Ring Road", "Civil Lines"],
    th: ["ถ.สุขุมวิท", "ถ.สีลม", "ถ.สาทร", "ถ.พระราม 4", "ถ.เจริญกรุง", "ถ.รัชดาภิเษก", "ถ.วิทยุ", "ถ.เพชรบุรี"],
    vi: ["Đường Nguyễn Huệ", "Đường Lê Lợi", "Đường Hai Bà Trưng", "Đường Điện Biên Phủ", "Đường Trần Hưng Đạo", "Đường Lý Tự Trọng"],
    tr: ["İstiklal Caddesi", "Atatürk Bulvarı", "Cumhuriyet Caddesi", "Bağdat Caddesi", "Vatan Caddesi", "Halaskargazi Cad."],
    ms: ["Jalan Sultan Ismail", "Jalan Bukit Bintang", "Jalan Ampang", "Jalan Tun Razak", "Jalan Raja Chulan", "Jalan Pudu"],
    af: ["Voortrekker Rd", "Church St", "Jan Smuts Ave", "Nelson Mandela Dr", "Main Rd", "Long St", "Bree St", "Loop St"],
    sw: ["Barabara ya Uhuru", "Njia ya Amani", "Barabara ya Nyerere", "Njia Kuu", "Barabara ya Biashara"],
    generic: ["1st Avenue", "2nd Street", "3rd Boulevard", "Central Road", "Independence Ave", "Liberation Rd", "Unity St", "Market Rd", "Commerce St", "Garden Rd"],
};

const COUNTRIES: CountryData[] = [
    // ══════ AMERICAS ══════
    { name: "United States", code: "US", cities: ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "Philadelphia", "San Antonio", "San Diego", "Dallas", "Austin", "Jacksonville", "San Jose", "Columbus", "Charlotte", "Denver", "Seattle", "Portland", "Nashville", "Atlanta", "Miami"], streetPatterns: GENERIC_STREETS.en, states: ["CA", "TX", "NY", "FL", "IL", "PA", "OH", "GA", "NC", "MI", "NJ", "VA", "WA", "AZ", "MA", "TN", "IN", "MO", "MD", "CO", "OR", "KY", "WI", "NV", "SC"], postalFormat: "#####", phonePrefix: "+1" },
    { name: "Canada", code: "CA", cities: ["Toronto", "Montreal", "Vancouver", "Calgary", "Edmonton", "Ottawa", "Winnipeg", "Quebec City", "Hamilton", "Victoria", "Halifax", "Regina"], streetPatterns: GENERIC_STREETS.en, states: ["ON", "QC", "BC", "AB", "MB", "SK", "NB", "NS", "PE", "NL"], postalFormat: "A#A #A#", phonePrefix: "+1" },
    { name: "Mexico", code: "MX", cities: ["Mexico City", "Guadalajara", "Monterrey", "Puebla", "Cancún", "Tijuana", "Mérida", "León", "Querétaro", "Oaxaca", "Acapulco", "Chihuahua"], streetPatterns: GENERIC_STREETS.es, states: ["CDMX", "JAL", "NL", "PUE", "QR", "BC", "YUC", "GTO", "QRO", "OAX"], postalFormat: "#####", phonePrefix: "+52" },
    { name: "Brazil", code: "BR", cities: ["São Paulo", "Rio de Janeiro", "Brasília", "Salvador", "Fortaleza", "Belo Horizonte", "Manaus", "Curitiba", "Recife", "Porto Alegre", "Campinas", "Santos"], streetPatterns: GENERIC_STREETS.pt, states: ["SP", "RJ", "MG", "BA", "RS", "PR", "PE", "CE", "PA", "GO"], postalFormat: "#####-###", phonePrefix: "+55" },
    { name: "Argentina", code: "AR", cities: ["Buenos Aires", "Córdoba", "Rosario", "Mendoza", "La Plata", "Tucumán", "Mar del Plata", "Salta", "Santa Fe"], streetPatterns: GENERIC_STREETS.es, states: ["CABA", "BA", "CBA", "SF", "MZA", "TUC"], postalFormat: "A####AAA", phonePrefix: "+54" },
    { name: "Colombia", code: "CO", cities: ["Bogotá", "Medellín", "Cali", "Barranquilla", "Cartagena", "Bucaramanga", "Pereira", "Santa Marta"], streetPatterns: GENERIC_STREETS.es, postalFormat: "######", phonePrefix: "+57" },
    { name: "Chile", code: "CL", cities: ["Santiago", "Valparaíso", "Concepción", "Antofagasta", "Viña del Mar", "Temuco", "La Serena", "Iquique"], streetPatterns: GENERIC_STREETS.es, postalFormat: "#######", phonePrefix: "+56" },
    { name: "Peru", code: "PE", cities: ["Lima", "Arequipa", "Cusco", "Trujillo", "Chiclayo", "Piura", "Iquitos", "Huancayo"], streetPatterns: GENERIC_STREETS.es, postalFormat: "#####", phonePrefix: "+51" },
    { name: "Venezuela", code: "VE", cities: ["Caracas", "Maracaibo", "Valencia", "Barquisimeto", "Maracay", "Ciudad Guayana"], streetPatterns: GENERIC_STREETS.es, postalFormat: "####", phonePrefix: "+58" },
    { name: "Ecuador", code: "EC", cities: ["Quito", "Guayaquil", "Cuenca", "Ambato", "Manta", "Portoviejo"], streetPatterns: GENERIC_STREETS.es, postalFormat: "######", phonePrefix: "+593" },
    { name: "Bolivia", code: "BO", cities: ["La Paz", "Santa Cruz", "Cochabamba", "Sucre", "Oruro", "Tarija"], streetPatterns: GENERIC_STREETS.es, postalFormat: "####", phonePrefix: "+591" },
    { name: "Paraguay", code: "PY", cities: ["Asunción", "Ciudad del Este", "San Lorenzo", "Luque", "Capiatá"], streetPatterns: GENERIC_STREETS.es, postalFormat: "####", phonePrefix: "+595" },
    { name: "Uruguay", code: "UY", cities: ["Montevideo", "Salto", "Paysandú", "Las Piedras", "Rivera"], streetPatterns: GENERIC_STREETS.es, postalFormat: "#####", phonePrefix: "+598" },
    { name: "Costa Rica", code: "CR", cities: ["San José", "Alajuela", "Cartago", "Heredia", "Liberia"], streetPatterns: GENERIC_STREETS.es, postalFormat: "#####", phonePrefix: "+506" },
    { name: "Panama", code: "PA", cities: ["Panama City", "Colón", "David", "Santiago", "Chitré"], streetPatterns: GENERIC_STREETS.es, postalFormat: "####", phonePrefix: "+507" },
    { name: "Cuba", code: "CU", cities: ["Havana", "Santiago de Cuba", "Camagüey", "Holguín", "Santa Clara"], streetPatterns: GENERIC_STREETS.es, postalFormat: "#####", phonePrefix: "+53" },
    { name: "Dominican Republic", code: "DO", cities: ["Santo Domingo", "Santiago", "La Romana", "San Pedro", "Puerto Plata"], streetPatterns: GENERIC_STREETS.es, postalFormat: "#####", phonePrefix: "+1" },
    { name: "Guatemala", code: "GT", cities: ["Guatemala City", "Mixco", "Villa Nueva", "Quetzaltenango", "Escuintla"], streetPatterns: GENERIC_STREETS.es, postalFormat: "#####", phonePrefix: "+502" },
    { name: "Honduras", code: "HN", cities: ["Tegucigalpa", "San Pedro Sula", "Choloma", "La Ceiba", "Comayagua"], streetPatterns: GENERIC_STREETS.es, postalFormat: "#####", phonePrefix: "+504" },
    { name: "El Salvador", code: "SV", cities: ["San Salvador", "Santa Ana", "San Miguel", "Soyapango", "Mejicanos"], streetPatterns: GENERIC_STREETS.es, postalFormat: "####", phonePrefix: "+503" },
    { name: "Nicaragua", code: "NI", cities: ["Managua", "León", "Masaya", "Chinandega", "Matagalpa"], streetPatterns: GENERIC_STREETS.es, postalFormat: "#####", phonePrefix: "+505" },
    { name: "Jamaica", code: "JM", cities: ["Kingston", "Montego Bay", "Spanish Town", "Portmore", "Mandeville"], streetPatterns: GENERIC_STREETS.en, postalFormat: "##", phonePrefix: "+1" },
    // ══════ EUROPE ══════
    { name: "United Kingdom", code: "GB", cities: ["London", "Manchester", "Birmingham", "Leeds", "Glasgow", "Liverpool", "Bristol", "Edinburgh", "Sheffield", "Cardiff", "Belfast", "Nottingham", "Newcastle", "Brighton", "Oxford", "Cambridge", "York", "Bath"], streetPatterns: GENERIC_STREETS.en, postalFormat: "AA## #AA", phonePrefix: "+44" },
    { name: "Germany", code: "DE", cities: ["Berlin", "Munich", "Hamburg", "Frankfurt", "Cologne", "Stuttgart", "Düsseldorf", "Leipzig", "Dortmund", "Essen", "Bremen", "Dresden", "Hanover", "Nuremberg"], streetPatterns: GENERIC_STREETS.de, states: ["BY", "NW", "BW", "NI", "HE", "SN", "RP", "SH", "BB", "BE", "HH"], postalFormat: "#####", phonePrefix: "+49" },
    { name: "France", code: "FR", cities: ["Paris", "Marseille", "Lyon", "Toulouse", "Nice", "Nantes", "Strasbourg", "Montpellier", "Bordeaux", "Lille", "Rennes", "Grenoble", "Dijon", "Tours"], streetPatterns: GENERIC_STREETS.fr, postalFormat: "#####", phonePrefix: "+33" },
    { name: "Italy", code: "IT", cities: ["Rome", "Milan", "Naples", "Turin", "Florence", "Bologna", "Genoa", "Palermo", "Venice", "Verona", "Bari", "Catania"], streetPatterns: ["Via Roma", "Via Garibaldi", "Via Dante", "Corso Vittorio", "Via Mazzini", "Via Nazionale", "Via Veneto", "Viale Europa", "Via della Repubblica", "Via Cavour"], postalFormat: "#####", phonePrefix: "+39" },
    { name: "Spain", code: "ES", cities: ["Madrid", "Barcelona", "Valencia", "Seville", "Zaragoza", "Málaga", "Bilbao", "Granada", "Alicante", "Córdoba", "Valladolid", "Vigo"], streetPatterns: GENERIC_STREETS.es, postalFormat: "#####", phonePrefix: "+34" },
    { name: "Netherlands", code: "NL", cities: ["Amsterdam", "Rotterdam", "The Hague", "Utrecht", "Eindhoven", "Tilburg", "Groningen", "Breda", "Nijmegen", "Arnhem"], streetPatterns: ["Keizersgracht", "Herengracht", "Prinsengracht", "Kalverstraat", "Leidsestraat", "Singel", "Vijzelstraat", "Damrak", "Overtoom", "Raadhuisstraat"], postalFormat: "#### AA", phonePrefix: "+31" },
    { name: "Belgium", code: "BE", cities: ["Brussels", "Antwerp", "Ghent", "Charleroi", "Liège", "Bruges", "Namur", "Leuven"], streetPatterns: GENERIC_STREETS.fr, postalFormat: "####", phonePrefix: "+32" },
    { name: "Switzerland", code: "CH", cities: ["Zurich", "Geneva", "Basel", "Bern", "Lausanne", "Winterthur", "Lucerne", "St. Gallen"], streetPatterns: GENERIC_STREETS.de, postalFormat: "####", phonePrefix: "+41" },
    { name: "Austria", code: "AT", cities: ["Vienna", "Graz", "Linz", "Salzburg", "Innsbruck", "Klagenfurt"], streetPatterns: GENERIC_STREETS.de, postalFormat: "####", phonePrefix: "+43" },
    { name: "Portugal", code: "PT", cities: ["Lisbon", "Porto", "Faro", "Braga", "Coimbra", "Funchal", "Aveiro"], streetPatterns: GENERIC_STREETS.pt, postalFormat: "####-###", phonePrefix: "+351" },
    { name: "Poland", code: "PL", cities: ["Warsaw", "Kraków", "Łódź", "Wrocław", "Poznań", "Gdańsk", "Szczecin", "Lublin", "Katowice"], streetPatterns: ["ul. Marszałkowska", "ul. Nowy Świat", "ul. Krakowska", "ul. Warszawska", "ul. Główna", "ul. Lipowa", "ul. Kościuszki", "ul. Piłsudskiego"], postalFormat: "##-###", phonePrefix: "+48" },
    { name: "Sweden", code: "SE", cities: ["Stockholm", "Gothenburg", "Malmö", "Uppsala", "Linköping", "Örebro", "Västerås", "Helsingborg"], streetPatterns: ["Kungsgatan", "Drottninggatan", "Storgatan", "Vasagatan", "Birger Jarlsgatan", "Sveavägen", "Norrlandsgatan", "Hamngatan"], postalFormat: "### ##", phonePrefix: "+46" },
    { name: "Norway", code: "NO", cities: ["Oslo", "Bergen", "Trondheim", "Stavanger", "Drammen", "Tromsø", "Kristiansand"], streetPatterns: ["Karl Johans gate", "Storgata", "Kirkegata", "Kongens gate", "Torggata", "Markveien", "Grünerløkka"], postalFormat: "####", phonePrefix: "+47" },
    { name: "Denmark", code: "DK", cities: ["Copenhagen", "Aarhus", "Odense", "Aalborg", "Esbjerg", "Randers", "Kolding"], streetPatterns: ["Strøget", "Vesterbrogade", "Nørrebrogade", "Østerbrogade", "Hovedgaden", "Algade", "Jernbanegade"], postalFormat: "####", phonePrefix: "+45" },
    { name: "Finland", code: "FI", cities: ["Helsinki", "Espoo", "Tampere", "Turku", "Oulu", "Vantaa", "Jyväskylä"], streetPatterns: ["Mannerheimintie", "Aleksanterinkatu", "Hämeenkatu", "Keskuskatu", "Kauppakatu", "Kirkkokatu"], postalFormat: "#####", phonePrefix: "+358" },
    { name: "Ireland", code: "IE", cities: ["Dublin", "Cork", "Galway", "Limerick", "Waterford", "Kilkenny", "Drogheda"], streetPatterns: GENERIC_STREETS.en, postalFormat: "A## A#A#", phonePrefix: "+353" },
    { name: "Czech Republic", code: "CZ", cities: ["Prague", "Brno", "Ostrava", "Plzeň", "Liberec", "Olomouc"], streetPatterns: ["Václavské náměstí", "Národní", "Vinohradská", "Karlova", "Dlouhá", "Na Příkopě", "Sokolská"], postalFormat: "### ##", phonePrefix: "+420" },
    { name: "Hungary", code: "HU", cities: ["Budapest", "Debrecen", "Szeged", "Miskolc", "Pécs", "Győr"], streetPatterns: ["Andrássy út", "Rákóczi út", "Váci utca", "Kossuth Lajos utca", "Petőfi utca", "Szent István körút"], postalFormat: "####", phonePrefix: "+36" },
    { name: "Romania", code: "RO", cities: ["Bucharest", "Cluj-Napoca", "Timișoara", "Iași", "Constanța", "Brașov", "Craiova"], streetPatterns: ["Strada Victoriei", "Bulevardul Unirii", "Calea Moșilor", "Strada Lipscani", "Bulevardul Magheru"], postalFormat: "######", phonePrefix: "+40" },
    { name: "Greece", code: "GR", cities: ["Athens", "Thessaloniki", "Patras", "Heraklion", "Larissa", "Volos", "Rhodes"], streetPatterns: ["Οδός Ερμού", "Λεωφ. Βασ. Σοφίας", "Οδός Πανεπιστημίου", "Οδός Σταδίου", "Λεωφ. Αλεξάνδρας"], postalFormat: "### ##", phonePrefix: "+30" },
    { name: "Croatia", code: "HR", cities: ["Zagreb", "Split", "Rijeka", "Osijek", "Zadar", "Dubrovnik"], streetPatterns: ["Ilica", "Jurišićeva", "Petrinjska", "Vlaška", "Savska cesta", "Maksimirska"], postalFormat: "#####", phonePrefix: "+385" },
    { name: "Serbia", code: "RS", cities: ["Belgrade", "Novi Sad", "Niš", "Kragujevac", "Subotica"], streetPatterns: ["Knez Mihailova", "Terazije", "Bulevar Kralja Aleksandra", "Nemanjina"], postalFormat: "#####", phonePrefix: "+381" },
    { name: "Bulgaria", code: "BG", cities: ["Sofia", "Plovdiv", "Varna", "Burgas", "Ruse", "Stara Zagora"], streetPatterns: ["бул. Витоша", "ул. Граф Игнатиев", "бул. Цар Освободител", "ул. Раковски"], postalFormat: "####", phonePrefix: "+359" },
    { name: "Slovakia", code: "SK", cities: ["Bratislava", "Košice", "Prešov", "Žilina", "Nitra", "Banská Bystrica"], streetPatterns: ["Obchodná", "Štúrova", "Hlavná", "Hviezdoslavovo námestie", "Laurinská"], postalFormat: "### ##", phonePrefix: "+421" },
    { name: "Slovenia", code: "SI", cities: ["Ljubljana", "Maribor", "Celje", "Kranj", "Koper"], streetPatterns: ["Čopova", "Slovenska cesta", "Dunajska cesta", "Trubarjeva", "Miklošičeva"], postalFormat: "####", phonePrefix: "+386" },
    { name: "Lithuania", code: "LT", cities: ["Vilnius", "Kaunas", "Klaipėda", "Šiauliai", "Panevėžys"], streetPatterns: ["Gedimino pr.", "Pilies g.", "Vokiečių g.", "Didžioji g.", "Vilniaus g."], postalFormat: "#####", phonePrefix: "+370" },
    { name: "Latvia", code: "LV", cities: ["Riga", "Daugavpils", "Liepāja", "Jelgava", "Jūrmala"], streetPatterns: ["Brīvības iela", "Elizabetes iela", "Kaļķu iela", "Tērbatas iela"], postalFormat: "LV-####", phonePrefix: "+371" },
    { name: "Estonia", code: "EE", cities: ["Tallinn", "Tartu", "Narva", "Pärnu", "Viljandi"], streetPatterns: ["Viru tänav", "Pärnu maantee", "Narva maantee", "Tartu maantee"], postalFormat: "#####", phonePrefix: "+372" },
    { name: "Iceland", code: "IS", cities: ["Reykjavik", "Kópavogur", "Hafnarfjörður", "Akureyri", "Garðabær"], streetPatterns: ["Laugavegur", "Skólavörðustígur", "Bankastræti", "Hverfisgata"], postalFormat: "###", phonePrefix: "+354" },
    { name: "Luxembourg", code: "LU", cities: ["Luxembourg City", "Esch-sur-Alzette", "Differdange", "Dudelange"], streetPatterns: GENERIC_STREETS.fr, postalFormat: "####", phonePrefix: "+352" },
    { name: "Ukraine", code: "UA", cities: ["Kyiv", "Kharkiv", "Odesa", "Dnipro", "Lviv", "Zaporizhzhia", "Donetsk"], streetPatterns: ["вул. Хрещатик", "вул. Грушевського", "просп. Свободи", "вул. Шевченка"], postalFormat: "#####", phonePrefix: "+380" },
    { name: "Belarus", code: "BY", cities: ["Minsk", "Gomel", "Mogilev", "Vitebsk", "Grodno", "Brest"], streetPatterns: GENERIC_STREETS.ru, postalFormat: "######", phonePrefix: "+375" },
    { name: "Russia", code: "RU", cities: ["Moscow", "St. Petersburg", "Novosibirsk", "Yekaterinburg", "Kazan", "Nizhny Novgorod", "Chelyabinsk", "Samara", "Rostov-on-Don"], streetPatterns: GENERIC_STREETS.ru, postalFormat: "######", phonePrefix: "+7" },
    // ══════ ASIA ══════
    { name: "China", code: "CN", cities: ["Beijing", "Shanghai", "Guangzhou", "Shenzhen", "Chengdu", "Hangzhou", "Wuhan", "Nanjing", "Chongqing", "Xi'an", "Suzhou", "Tianjin"], streetPatterns: GENERIC_STREETS.zh, postalFormat: "######", phonePrefix: "+86" },
    { name: "Japan", code: "JP", cities: ["Tokyo", "Osaka", "Yokohama", "Nagoya", "Sapporo", "Kobe", "Kyoto", "Fukuoka", "Kawasaki", "Hiroshima", "Sendai", "Chiba"], streetPatterns: GENERIC_STREETS.ja, postalFormat: "###-####", phonePrefix: "+81" },
    { name: "South Korea", code: "KR", cities: ["Seoul", "Busan", "Incheon", "Daegu", "Daejeon", "Gwangju", "Suwon", "Ulsan", "Changwon", "Seongnam"], streetPatterns: GENERIC_STREETS.ko, postalFormat: "#####", phonePrefix: "+82" },
    { name: "India", code: "IN", cities: ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Kolkata", "Ahmedabad", "Pune", "Jaipur", "Lucknow", "Kanpur", "Nagpur"], streetPatterns: GENERIC_STREETS.hi, states: ["MH", "DL", "KA", "TG", "TN", "WB", "GJ", "UP", "RJ", "MP"], postalFormat: "######", phonePrefix: "+91" },
    { name: "Indonesia", code: "ID", cities: ["Jakarta", "Surabaya", "Bandung", "Medan", "Semarang", "Makassar", "Palembang", "Tangerang", "Depok", "Bekasi", "Yogyakarta", "Bogor", "Malang", "Denpasar"], streetPatterns: GENERIC_STREETS.id, postalFormat: "#####", phonePrefix: "+62" },
    { name: "Thailand", code: "TH", cities: ["Bangkok", "Chiang Mai", "Phuket", "Pattaya", "Nonthaburi", "Hat Yai", "Nakhon Ratchasima", "Khon Kaen", "Udon Thani"], streetPatterns: GENERIC_STREETS.th, postalFormat: "#####", phonePrefix: "+66" },
    { name: "Vietnam", code: "VN", cities: ["Ho Chi Minh City", "Hanoi", "Da Nang", "Hai Phong", "Can Tho", "Nha Trang", "Hue", "Bien Hoa"], streetPatterns: GENERIC_STREETS.vi, postalFormat: "######", phonePrefix: "+84" },
    { name: "Philippines", code: "PH", cities: ["Manila", "Quezon City", "Davao", "Cebu", "Zamboanga", "Antipolo", "Pasig", "Taguig", "Makati"], streetPatterns: GENERIC_STREETS.en, postalFormat: "####", phonePrefix: "+63" },
    { name: "Malaysia", code: "MY", cities: ["Kuala Lumpur", "Penang", "Johor Bahru", "Kuching", "Kota Kinabalu", "Malacca", "Ipoh", "Shah Alam", "Petaling Jaya"], streetPatterns: GENERIC_STREETS.ms, postalFormat: "#####", phonePrefix: "+60" },
    { name: "Singapore", code: "SG", cities: ["Singapore"], streetPatterns: ["Orchard Road", "Raffles Place", "Marina Boulevard", "Shenton Way", "Cecil Street", "Robinson Road", "Bukit Timah Road", "Clementi Road"], postalFormat: "######", phonePrefix: "+65" },
    { name: "Taiwan", code: "TW", cities: ["Taipei", "Kaohsiung", "Taichung", "Tainan", "Hsinchu", "Keelung", "Taoyuan"], streetPatterns: GENERIC_STREETS.zh, postalFormat: "###", phonePrefix: "+886" },
    { name: "Pakistan", code: "PK", cities: ["Karachi", "Lahore", "Islamabad", "Faisalabad", "Rawalpindi", "Multan", "Peshawar", "Quetta"], streetPatterns: GENERIC_STREETS.en, postalFormat: "#####", phonePrefix: "+92" },
    { name: "Bangladesh", code: "BD", cities: ["Dhaka", "Chittagong", "Khulna", "Rajshahi", "Sylhet", "Comilla", "Gazipur"], streetPatterns: GENERIC_STREETS.en, postalFormat: "####", phonePrefix: "+880" },
    { name: "Sri Lanka", code: "LK", cities: ["Colombo", "Kandy", "Galle", "Jaffna", "Negombo", "Trincomalee"], streetPatterns: GENERIC_STREETS.en, postalFormat: "#####", phonePrefix: "+94" },
    { name: "Nepal", code: "NP", cities: ["Kathmandu", "Pokhara", "Lalitpur", "Biratnagar", "Bharatpur"], streetPatterns: GENERIC_STREETS.en, postalFormat: "#####", phonePrefix: "+977" },
    { name: "Myanmar", code: "MM", cities: ["Yangon", "Mandalay", "Naypyidaw", "Mawlamyine", "Bago"], streetPatterns: GENERIC_STREETS.en, postalFormat: "#####", phonePrefix: "+95" },
    { name: "Cambodia", code: "KH", cities: ["Phnom Penh", "Siem Reap", "Battambang", "Sihanoukville", "Kampong Cham"], streetPatterns: GENERIC_STREETS.generic, postalFormat: "#####", phonePrefix: "+855" },
    { name: "Laos", code: "LA", cities: ["Vientiane", "Luang Prabang", "Pakse", "Savannakhet", "Thakhek"], streetPatterns: GENERIC_STREETS.generic, postalFormat: "#####", phonePrefix: "+856" },
    { name: "Mongolia", code: "MN", cities: ["Ulaanbaatar", "Erdenet", "Darkhan", "Choibalsan", "Mörön"], streetPatterns: GENERIC_STREETS.generic, postalFormat: "######", phonePrefix: "+976" },
    // ══════ MIDDLE EAST ══════
    { name: "United Arab Emirates", code: "AE", cities: ["Dubai", "Abu Dhabi", "Sharjah", "Ajman", "Ras Al Khaimah", "Fujairah", "Al Ain"], streetPatterns: GENERIC_STREETS.ar, postalFormat: "#####", phonePrefix: "+971" },
    { name: "Saudi Arabia", code: "SA", cities: ["Riyadh", "Jeddah", "Mecca", "Medina", "Dammam", "Khobar", "Tabuk", "Abha"], streetPatterns: GENERIC_STREETS.ar, postalFormat: "#####", phonePrefix: "+966" },
    { name: "Turkey", code: "TR", cities: ["Istanbul", "Ankara", "Izmir", "Bursa", "Antalya", "Adana", "Gaziantep", "Konya", "Mersin"], streetPatterns: GENERIC_STREETS.tr, postalFormat: "#####", phonePrefix: "+90" },
    { name: "Israel", code: "IL", cities: ["Tel Aviv", "Jerusalem", "Haifa", "Rishon LeZion", "Petah Tikva", "Ashdod", "Beer Sheva"], streetPatterns: GENERIC_STREETS.en, postalFormat: "#######", phonePrefix: "+972" },
    { name: "Iran", code: "IR", cities: ["Tehran", "Isfahan", "Shiraz", "Mashhad", "Tabriz", "Karaj", "Ahvaz"], streetPatterns: GENERIC_STREETS.ar, postalFormat: "##########", phonePrefix: "+98" },
    { name: "Iraq", code: "IQ", cities: ["Baghdad", "Basra", "Erbil", "Mosul", "Sulaymaniyah", "Najaf", "Karbala"], streetPatterns: GENERIC_STREETS.ar, postalFormat: "#####", phonePrefix: "+964" },
    { name: "Jordan", code: "JO", cities: ["Amman", "Zarqa", "Irbid", "Aqaba", "Madaba"], streetPatterns: GENERIC_STREETS.ar, postalFormat: "#####", phonePrefix: "+962" },
    { name: "Lebanon", code: "LB", cities: ["Beirut", "Tripoli", "Sidon", "Tyre", "Jounieh", "Byblos"], streetPatterns: GENERIC_STREETS.ar, postalFormat: "#### ####", phonePrefix: "+961" },
    { name: "Kuwait", code: "KW", cities: ["Kuwait City", "Hawalli", "Salmiya", "Jahra", "Farwaniya"], streetPatterns: GENERIC_STREETS.ar, postalFormat: "#####", phonePrefix: "+965" },
    { name: "Qatar", code: "QA", cities: ["Doha", "Al Wakrah", "Al Khor", "Mesaieed", "Dukhan"], streetPatterns: GENERIC_STREETS.ar, postalFormat: "#####", phonePrefix: "+974" },
    { name: "Bahrain", code: "BH", cities: ["Manama", "Riffa", "Muharraq", "Hamad Town", "Isa Town"], streetPatterns: GENERIC_STREETS.ar, postalFormat: "####", phonePrefix: "+973" },
    { name: "Oman", code: "OM", cities: ["Muscat", "Salalah", "Sohar", "Nizwa", "Sur"], streetPatterns: GENERIC_STREETS.ar, postalFormat: "###", phonePrefix: "+968" },
    // ══════ AFRICA ══════
    { name: "South Africa", code: "ZA", cities: ["Johannesburg", "Cape Town", "Durban", "Pretoria", "Port Elizabeth", "Bloemfontein", "Nelspruit", "Polokwane"], streetPatterns: GENERIC_STREETS.af, states: ["GP", "WC", "KZN", "EC", "FS", "MP", "LP", "NW", "NC"], postalFormat: "####", phonePrefix: "+27" },
    { name: "Nigeria", code: "NG", cities: ["Lagos", "Abuja", "Kano", "Ibadan", "Port Harcourt", "Benin City", "Kaduna", "Enugu"], streetPatterns: GENERIC_STREETS.en, states: ["LA", "AB", "KN", "OY", "RV", "ED", "KD", "EN"], postalFormat: "######", phonePrefix: "+234" },
    { name: "Kenya", code: "KE", cities: ["Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret", "Malindi"], streetPatterns: GENERIC_STREETS.sw, postalFormat: "#####", phonePrefix: "+254" },
    { name: "Egypt", code: "EG", cities: ["Cairo", "Alexandria", "Giza", "Luxor", "Aswan", "Hurghada", "Sharm El Sheikh"], streetPatterns: GENERIC_STREETS.ar, postalFormat: "#####", phonePrefix: "+20" },
    { name: "Morocco", code: "MA", cities: ["Casablanca", "Rabat", "Marrakech", "Fes", "Tangier", "Agadir", "Meknes"], streetPatterns: GENERIC_STREETS.ar, postalFormat: "#####", phonePrefix: "+212" },
    { name: "Ghana", code: "GH", cities: ["Accra", "Kumasi", "Tamale", "Takoradi", "Cape Coast", "Tema"], streetPatterns: GENERIC_STREETS.en, postalFormat: "AA-###-####", phonePrefix: "+233" },
    { name: "Ethiopia", code: "ET", cities: ["Addis Ababa", "Dire Dawa", "Mekelle", "Bahir Dar", "Gondar", "Hawassa"], streetPatterns: GENERIC_STREETS.generic, postalFormat: "####", phonePrefix: "+251" },
    { name: "Tanzania", code: "TZ", cities: ["Dar es Salaam", "Dodoma", "Mwanza", "Arusha", "Zanzibar City", "Mbeya"], streetPatterns: GENERIC_STREETS.sw, postalFormat: "#####", phonePrefix: "+255" },
    { name: "Uganda", code: "UG", cities: ["Kampala", "Entebbe", "Jinja", "Gulu", "Mbarara", "Fort Portal"], streetPatterns: GENERIC_STREETS.en, postalFormat: "######", phonePrefix: "+256" },
    { name: "Tunisia", code: "TN", cities: ["Tunis", "Sfax", "Sousse", "Kairouan", "Bizerte", "Gabès"], streetPatterns: GENERIC_STREETS.ar, postalFormat: "####", phonePrefix: "+216" },
    { name: "Algeria", code: "DZ", cities: ["Algiers", "Oran", "Constantine", "Annaba", "Blida", "Batna"], streetPatterns: GENERIC_STREETS.ar, postalFormat: "#####", phonePrefix: "+213" },
    { name: "Senegal", code: "SN", cities: ["Dakar", "Thiès", "Saint-Louis", "Ziguinchor", "Kaolack"], streetPatterns: GENERIC_STREETS.fr, postalFormat: "#####", phonePrefix: "+221" },
    { name: "Cameroon", code: "CM", cities: ["Yaoundé", "Douala", "Bamenda", "Bafoussam", "Garoua"], streetPatterns: GENERIC_STREETS.fr, postalFormat: "#####", phonePrefix: "+237" },
    { name: "Mozambique", code: "MZ", cities: ["Maputo", "Matola", "Beira", "Nampula", "Chimoio"], streetPatterns: GENERIC_STREETS.pt, postalFormat: "####", phonePrefix: "+258" },
    { name: "Madagascar", code: "MG", cities: ["Antananarivo", "Toamasina", "Antsirabe", "Fianarantsoa", "Mahajanga"], streetPatterns: GENERIC_STREETS.fr, postalFormat: "###", phonePrefix: "+261" },
    { name: "Angola", code: "AO", cities: ["Luanda", "Huambo", "Lobito", "Benguela", "Lubango"], streetPatterns: GENERIC_STREETS.pt, postalFormat: "#####", phonePrefix: "+244" },
    // ══════ OCEANIA ══════
    { name: "Australia", code: "AU", cities: ["Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide", "Gold Coast", "Canberra", "Newcastle", "Hobart", "Darwin", "Cairns"], streetPatterns: GENERIC_STREETS.en, states: ["NSW", "VIC", "QLD", "WA", "SA", "TAS", "ACT", "NT"], postalFormat: "####", phonePrefix: "+61" },
    { name: "New Zealand", code: "NZ", cities: ["Auckland", "Wellington", "Christchurch", "Hamilton", "Dunedin", "Tauranga", "Queenstown"], streetPatterns: GENERIC_STREETS.en, postalFormat: "####", phonePrefix: "+64" },
];

/* ═══════════ GENERATION HELPERS ═══════════ */
function randomItem<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

function generatePostalCode(format: string): string {
    return format.split("").map((c) => {
        if (c === "#") return String(Math.floor(Math.random() * 10));
        if (c === "A") return String.fromCharCode(65 + Math.floor(Math.random() * 26));
        return c;
    }).join("");
}

function generatePhone(prefix: string): string {
    const d = Array.from({ length: 10 }, () => Math.floor(Math.random() * 10)).join("");
    return `${prefix} ${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`;
}

interface GeneratedAddress {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone: string;
    fullAddress: string;
}

function generateAddress(c: CountryData): GeneratedAddress {
    const num = Math.floor(Math.random() * 999) + 1;
    const street = `${num} ${randomItem(c.streetPatterns)}`;
    const city = randomItem(c.cities);
    const state = c.states ? randomItem(c.states) : "";
    const postalCode = generatePostalCode(c.postalFormat);
    const phone = generatePhone(c.phonePrefix);
    const parts = [street, city];
    if (state) parts.push(state);
    parts.push(postalCode, c.name);
    return { street, city, state, postalCode, country: c.name, phone, fullAddress: parts.join(", ") };
}

/* ═══════════ COMPONENT ═══════════ */
export default function AddressGenerator() {
    const [selectedCountry, setSelectedCountry] = useState("US");
    const [quantity, setQuantity] = useState(10);
    const [addresses, setAddresses] = useState<GeneratedAddress[]>([]);
    const [copied, setCopied] = useState<string | null>(null);
    const [search, setSearch] = useState("");

    const country = COUNTRIES.find((c) => c.code === selectedCountry)!;
    const filteredCountries = search
        ? COUNTRIES.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.code.toLowerCase().includes(search.toLowerCase()))
        : COUNTRIES;

    const generate = useCallback(() => {
        setAddresses(Array.from({ length: quantity }, () => generateAddress(country)));
    }, [country, quantity]);

    const copyAddress = async (text: string, id: string) => {
        await navigator.clipboard.writeText(text);
        setCopied(id);
        setTimeout(() => setCopied(null), 2000);
    };

    const copyAll = async () => {
        const text = addresses.map((a) => a.fullAddress).join("\n");
        await navigator.clipboard.writeText(text);
        setCopied("all");
        setTimeout(() => setCopied(null), 2000);
    };

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 md:py-12">
            <Link href="/#tools" className="inline-flex items-center gap-2 font-mono text-xs text-muted-foreground hover:text-foreground transition-colors mb-6">
                <ArrowLeft size={14} /> Back to Tools
            </Link>

            <div className="mb-8">
                <h1 className="text-3xl sm:text-4xl font-black mb-2 tracking-tight">Address Generator</h1>
                <p className="font-mono text-sm text-muted-foreground">
                    Generate realistic fake addresses for {COUNTRIES.length} countries. Instant, offline, no API calls.
                </p>
            </div>

            <div className="space-y-6">
                <MacWindow title="Settings">
                    <div className="space-y-4">
                        <div>
                            <label className="font-mono text-[10px] uppercase tracking-widest block mb-2 text-muted-foreground">Search Country</label>
                            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Type country name or code..." className="font-mono text-xs" />
                        </div>

                        <div className="grid grid-cols-5 sm:grid-cols-8 lg:grid-cols-10 gap-1 max-h-[200px] overflow-y-auto p-1">
                            {filteredCountries.map((c) => (
                                <button key={c.code} onClick={() => setSelectedCountry(c.code)}
                                    className={`py-1.5 px-1 font-mono text-[9px] font-bold border transition-all ${selectedCountry === c.code ? "border-accent/60 bg-accent/10 text-accent" : "border-border/30 text-muted-foreground hover:border-border/80"}`}
                                    title={c.name}>{c.code}</button>
                            ))}
                        </div>
                        <p className="font-mono text-[10px] text-muted-foreground">
                            Selected: <span className="text-accent font-bold">{country.name}</span>
                        </p>

                        <div>
                            <div className="flex justify-between mb-2">
                                <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Quantity</label>
                                <span className="font-mono text-xs text-foreground font-bold">{quantity}</span>
                            </div>
                            <input type="range" min="1" max="50" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} />
                        </div>

                        <button onClick={generate} className="w-full btn-brutal btn-brutal-accent flex items-center justify-center gap-2">
                            <RefreshCw size={14} /> Generate Addresses
                        </button>
                    </div>
                </MacWindow>

                {addresses.length > 0 && (
                    <MacWindow title={`Results (${addresses.length})`}>
                        <div className="flex items-center justify-between mb-4">
                            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{country.name}</p>
                            <div className="flex gap-2">
                                <button onClick={copyAll} className="btn-brutal text-[10px] flex items-center gap-1.5 !py-1.5 !px-3">
                                    {copied === "all" ? <Check size={11} /> : <Copy size={11} />}
                                    {copied === "all" ? "Copied!" : "Copy All"}
                                </button>
                                <button onClick={() => setAddresses([])} className="btn-brutal text-[10px] flex items-center gap-1.5 !py-1.5 !px-3">
                                    <Trash2 size={11} /> Clear
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            {addresses.map((addr, i) => (
                                <div key={i} className="p-3 border border-border/40 group hover:border-border/80 transition-colors">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1.5">
                                                <span className="font-mono text-[10px] text-muted-foreground/30">{String(i + 1).padStart(2, "0")}</span>
                                                <MapPin size={12} className="text-accent shrink-0" />
                                            </div>
                                            <p className="font-mono text-xs font-bold">{addr.street}</p>
                                            <p className="font-mono text-xs text-muted-foreground mt-0.5">
                                                {addr.city}{addr.state ? `, ${addr.state}` : ""} {addr.postalCode}
                                            </p>
                                            <p className="font-mono text-xs text-muted-foreground">{addr.country}</p>
                                            <p className="font-mono text-[9px] text-muted-foreground/40 mt-1">📞 {addr.phone}</p>
                                        </div>
                                        <button onClick={() => copyAddress(addr.fullAddress, `addr-${i}`)}
                                            className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 text-muted-foreground hover:text-foreground p-1 mt-1"
                                            title="Copy address">
                                            {copied === `addr-${i}` ? <Check size={14} /> : <Copy size={14} />}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </MacWindow>
                )}

                {addresses.length === 0 && (
                    <div className="border border-border/40 p-12 text-center">
                        <MapPin size={32} strokeWidth={1} className="mx-auto mb-3 text-muted-foreground/30" />
                        <p className="font-mono text-sm text-muted-foreground">Generated addresses will appear here</p>
                        <p className="font-mono text-[10px] text-muted-foreground/50 mt-1">Select a country and click Generate</p>
                    </div>
                )}
            </div>
        </div>
    );
}
