export interface Site {
    url: string;
    type: SiteType;
    available?: boolean;
}

export enum SiteType {
    naver = "naver"
}

export const TargetSites: Site[] = [
    { url: "https://m.place.naver.com/hospital/13239359/home", type: SiteType.naver },
    { url: "https://m.place.naver.com/hospital/35886634/home", type: SiteType.naver },
    { url: "https://m.place.naver.com/hospital/13239523/home", type: SiteType.naver },
    { url: "https://m.place.naver.com/hospital/13239421/home", type: SiteType.naver },
    { url: "https://m.place.naver.com/hospital/1110546516/home", type: SiteType.naver },
    { url: "https://m.place.naver.com/hospital/12039079/home", type: SiteType.naver },
    { url: "https://m.place.naver.com/hospital/11561476/home", type: SiteType.naver },
    { url: "https://m.place.naver.com/hospital/13240492/home", type: SiteType.naver },
    { url: "https://m.place.naver.com/hospital/32480987/home", type: SiteType.naver },
    { url: "https://m.place.naver.com/hospital/1642182114/home", type: SiteType.naver },
    { url: "https://m.place.naver.com/hospital/13238428/home", type: SiteType.naver },
    { url: "https://m.place.naver.com/hospital/13239198/home", type: SiteType.naver },
    { url: "https://m.place.naver.com/hospital/19878068/home", type: SiteType.naver },
    { url: "https://m.place.naver.com/hospital/21592333/home", type: SiteType.naver },
    { url: "https://m.place.naver.com/hospital/36286142/home", type: SiteType.naver },
    { url: "https://m.place.naver.com/hospital/32361453/home", type: SiteType.naver },

    
];
