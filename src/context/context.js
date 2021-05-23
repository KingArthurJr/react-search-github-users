import React, { useState, useEffect } from 'react';
import mockUser from './mockData.js/mockUser';
import mockRepos from './mockData.js/mockRepos';
import mockFollowers from './mockData.js/mockFollowers';
import axios from 'axios';
import Axios from 'axios';
import Followers from '../components/Followers';


const rootUrl = 'https://api.github.com';

const GithubContext = React.createContext()

const GithubProvider = ({children}) => {


const [githubUser, setGithubUser] = useState(mockUser)
const [githubRepos, setGithubRepos] = useState(mockRepos)
const [githubFollowers, setGithubFollowers] = useState(mockFollowers)


//requests & loading

const [requests, setRequests] = useState(0);
const [isLoading, setLoading] = useState(false);
//ERROR

const [error, setError] = useState({show:false,msg:''})

const searchGithubUser = async(user) => {
console.log(user);

toggleError()
setLoading(true)

const response = await axios(`${rootUrl}/users/${user}`).
catch(err => console.log(err));

if(response){
setGithubUser(response.data);
const {login, followers_url} = response.data;


await Promise.allSettled([
    axios(`${rootUrl}/users/${login}/repos?per_page=100`),
    axios(`${followers_url}?per_page=100`)]).then((results)=> {
    const [repos,followers] = results
    const status = 'fulfilled';
    if(repos.status === status){setGithubRepos(repos.value.data)
    }
    if(followers.status === status){setGithubFollowers(followers.value.data)
    }
}
    ).catch(err => console.log(err))
}else{
    toggleError(true,'there is no such user name')
}
checkRequests();
setLoading(false)


}


const checkRequests = () => {
    axios(`${rootUrl}/rate_limit`)
    .then(({data})=>{

    
        let {
            rate:{remaining}
        } = data;
            
        setRequests(remaining)
        if(remaining === 0){
        toggleError(true, 'sorry, no more requests for today')
        }
    })
    .catch((err)=>console.log(err))
}

function toggleError(show = false,msg=''){
    setError({show,msg})
}

useEffect(checkRequests,[])

    return <GithubContext.Provider value={{
            githubUser,
            githubRepos,
            githubFollowers,
            requests,
            error,
            searchGithubUser,
            isLoading
    }}>{children}</GithubContext.Provider>
}

export {GithubProvider, GithubContext};