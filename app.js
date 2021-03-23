const searchProfile = async (textSearch)=>{

    console.log('history',chrome.history);

    const selectorPage = {
        btnSearch:{
            text:textSearch,
            input:"#global-nav-typeahead input",
        },
        listSearch:{
            list:'.search-results-container ul>li',
            link:'.linked-area',
        }
    }
    /* Utils Timer */
    const wait = (milliseconds)=>{
        return new Promise(function(resolve){
            setTimeout(function(){
                resolve();
            },milliseconds)
        })
    }
    /* Utils selector List */
    const selectorListSearchResult = async (index)=>{
        const keywords = location.href
        const arreglo = keywords.split('/search/results/all/');
        arreglo.length
        if(arreglo.length < 2){
            await getSearch()
            await wait(3000)
        }
        const {listSearch:search} = selectorPage
        const resultList = document.querySelectorAll(search.list)
        return (index == undefined)?resultList:resultList[index]
    }


    /* Search input text */
    const getSearch = async ()=>{
        const {btnSearch:search} = selectorPage
        const input = document.querySelector(search.input)
        input.value = search.text
        const keycode = new KeyboardEvent('keydown', {'keyCode':13, 'which':13}); 
        input.dispatchEvent(keycode);  
    }
    /* Bucle list result  */
    const getListSearch = async ()=>{
        const resultList = await selectorListSearchResult()
        const profiles = []
        for (let index = 0; index < resultList.length; index++) {
            const item =  await selectorListSearchResult(index)
            const data = await clickOpenPage(item)
            profiles.push(data)
        }
        return profiles
    }                                                                               
  
    /* Click open page detail*/
    const personal = [];
    const clickOpenPage = async (item)=>{
        const {listSearch:search} = selectorPage
        item.querySelector(search.link).click()
        await wait(3000)
        const data = await scrapingProfile()
        personal.push(data)
        window.history.back()
        await wait(3000)

        return data
    }

    const scrapingProfile = async ()=>{
  
        const autoscrollToElement = async function(cssSelector){
    
            var exists = document.querySelector(cssSelector);
        
            while(exists){
                //
                let maxScrollTop = document.body.clientHeight - window.innerHeight;
                let elementScrollTop = document.querySelector(cssSelector).offsetHeight
                let currentScrollTop = window.scrollY
        
        
                if(maxScrollTop == currentScrollTop || elementScrollTop <= currentScrollTop)
                    break;
        
                await wait(32)
        
                let newScrollTop = Math.min(currentScrollTop + 20, maxScrollTop);
                window.scrollTo(0,newScrollTop)
            }
        
            console.log('finish autoscroll to element %s', cssSelector);
        
            return new Promise(function(resolve){
                resolve();
            });
        };
    
        //Logic
        const selectorProfile = {
            personalInformation:{
                name:"div.ph5.pb5 > div.display-flex.mt2 ul li",
                title:"div.ph5.pb5 > div.display-flex.mt2 h2",
                resume: 'section.pv-about-section > p',
                image:"div.ph5.pb5 > div.display-flex> div.pv-top-card--photo img"
            },
            experienceInformation:{
                list : '#experience-section > ul > li',
                groupByCompany:{
                    identify:'.pv-entity__position-group',
                    company: 'div.pv-entity__company-summary-info > h3 > span:nth-child(2)',
                    list: 'section > ul > li',
                    title: 'div > div > div > div > div > div > h3 > span:nth-child(2)',
                    date:'div > div > div > div > div > div > div > h4 > span:nth-child(2)',
                    description: '.pv-entity__description'
                },
                default:{
                    title: 'section > div > div > a > div.pv-entity__summary-info > h3',
                    company:'section > div > div > a > div.pv-entity__summary-info > p.pv-entity__secondary-title',
                    date: 'section > div > div > a > div.pv-entity__summary-info > div > h4.pv-entity__date-range > span:nth-child(2)',
                    description: 'section > div > div > div > p'
                }
            },
            educationInformation:{
                list: '#education-section > ul > li',
                institution :'div > div > a > div.pv-entity__summary-info > div > h3',
                career : 'div > div > a > div.pv-entity__summary-info > div > p > span:nth-child(2)',
                date : 'div > div > a > div.pv-entity__summary-info > p > span:nth-child(2)'
            }
        }
    
        const clickOnMoreResume = async ()=>{
            const elementMoreResume = document.getElementById('line-clamp-show-more-button')
            if(elementMoreResume) elementMoreResume.click()
        }
    
        const getPersonalInformation = async ()=>{
            const {personalInformation:selector} = selectorProfile
            const elementNameProfile = document.querySelector(selector.name)
            const elementNameTitle = document.querySelector(selector.title)
            const elementResume = document.querySelector(selector.resume)
            const elementImage = document.querySelector(selector.image)
            
            const name = elementNameProfile?.innerText
            const title = elementNameTitle?.innerText
            const resume = elementResume?.innerText
            const image = elementImage?.src
            return {name,title,resume,image}
        }
    
        const getExperienceInformation = async ()=>{
            const {experienceInformation:selector} = selectorProfile
            //get information
            let experiencesRawList = document.querySelectorAll(selector.list)
            let experiencesRawArray = Array.from(experiencesRawList)
    
            const groupCompaniesList = experiencesRawArray.filter(el=>{
                let groupCompanyExperience = el.querySelectorAll(selector.groupByCompany.identify)  
                return groupCompanyExperience.length >0
            })
    
            const uniqueExperienceList = experiencesRawArray.filter(el=>{
                let groupCompanyExperience = el.querySelectorAll(selector.groupByCompany.identify)  
                return groupCompanyExperience.length ==0
            })
            
            const experiences = uniqueExperienceList.map(el=>{
                const title = el.querySelector(selector.default.title)?.innerText
                const date = el.querySelector(selector.default.date)?.innerText
                const company = el.querySelector(selector.default.company)?.innerText
                const description = el.querySelector(selector.default.description)?.innerText
                
                return {title,date,company,description}
            })
    
            for(let i = 0; i< groupCompaniesList.length;i++){
                const item = groupCompaniesList[i]
                const company = item.querySelector(selector.groupByCompany.company)?.innerText
                const itemsCompanyGroupList = item.querySelectorAll(selector.groupByCompany.list)
                const itemsCompanyGroupArray = Array.from(itemsCompanyGroupList)
    
                const experiencesData = itemsCompanyGroupArray.map(el=>{
                    const title = el.querySelector(selector.groupByCompany.title)?.innerText
                    const date = el.querySelector(selector.groupByCompany.date)?.innerText
                    const description = el.querySelector(selector.groupByCompany.description)?.innerText
                    
                    return {title,date,company,description}
                })
                experiences.push(...experiencesData)
            }
            return experiences
        }
    
        const getEducationInformation = async ()=>{
            const {educationInformation:selector} = selectorProfile
            const educationItems = document.querySelectorAll(selector.list)
            const educationArray = Array.from(educationItems)
            const educations = educationArray.map(el=>{
                const institution = el.querySelector(selector.institution).innerText
                const career = el.querySelector(selector.career).innerText
                const date = el.querySelector(selector.date)
                var dates = date?date.innerText:'';
                return {institution,career,dates}
            })
            return educations
        }
    
        await autoscrollToElement('body')
        await clickOnMoreResume()
        
        //Scraping Complete Profile
        const personalInformation =  await getPersonalInformation()
        const experienceInformation = await getExperienceInformation()
        const educationInformation = await getEducationInformation()
        
       // pre.innerText = 'Ya tenemos las información del perfil'
        await wait(1000)
    
        //Setting data to send information
        const profile = {...personalInformation, experiences:experienceInformation, educations:educationInformation }

        await wait(2000)
        return profile;
    }
    
    const createNav = async ()=> {
        const styleDiv = "background-color: #000000b8;width: 100vw; height: 100vh; position: fixed; z-index: 99;";
        const divBlack = document.createElement('div')
        divBlack.id = "profile-list"
        divBlack.style = styleDiv

        const divWhite = document.createElement('div')
        divWhite.style = "background-color: white;width: 500px;height: 100vh;margin: 0 auto;padding: 20px;"
        



        const bodyElement = document.querySelector('body.boot-complete')
        var thefrist = bodyElement.firstChild

        bodyElement.insertBefore(divBlack,thefrist)

        const container = document.getElementById('profile-list')
        container.appendChild(divWhite)


    }
    /* init search profile */
    await createNav()
    /*await getSearch()
    await wait(3000)
    const listresult = await getListSearch()
    await wait(3000)
    await createNav(listresult)*/
}

//Comunication
(function(){
    chrome.runtime.onConnect.addListener(function(port) {
        port.onMessage.addListener(function(msg) {
          const {acction} = msg
          const {searchtext} = msg
     
          switch(acction){
              case "search":
                  searchProfile(searchtext)
              break;
          }
        });
})})();
    