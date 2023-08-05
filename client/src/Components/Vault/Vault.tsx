import React, { useEffect, useState } from 'react';
import { VaultBrowser } from '../../Classes/VaultBrowser';
import { v4 as uuidGen } from 'uuid';
import NewPasswordForm from '../NewPasswordForm/NewPasswordForm';
import Password from '../Password/Password';
import { verifyToken } from '../../Helpers/Auth';
import { useNavigate } from 'react-router-dom';
import LogoutPopup from '../LogoutPopup/LogoutPopup';
import searchIcon from '../../Assets/search.svg';
import settingsGear from '../../Assets/settings-outline.svg';

export default function VaultComponent({vaultBrowser}:{vaultBrowser:VaultBrowser}){
  const [passwords,setPasswords] = useState<any[]>([]);
  const [passSnip,setPassSnip] = useState<any[]>([]);
  const [searchInput,setSearchInput] = useState<string>('');
  const [isUserLoggedOut,setIsUserLoggedOut] = useState<boolean>(false);
  const vault = vaultBrowser.vault;
  /*
    whenever the passwords list is updated (for example the user creates a new password) this useEffect makes sure that the
    new password is included in the search by performing a search on the updated passwords list.

    additionally this useEffect will perform searches automatically as the user types. (accomplished by adding the searchInput as a useEffect dependency)
  */
  useEffect(()=>{
    setPassSnip(()=>{
      return passwords.filter((password) => {
        return password.nickName.includes(searchInput);
      });
    });
  },[passwords,searchInput]);

  const navigate = useNavigate();

  //get passwords to populate passwords state on initial page load
  useEffect(()=>{
    const handleInitialPageLoad = async()=>{
      //verify the users token and master password is present
      if (await verifyToken(localStorage.getItem('token') as string) && vault.masterPassword){
        setPasswords(await vaultBrowser.vault.populatePasswords());
      }else{
        //show user logged out popup
        setIsUserLoggedOut(true);
      }
    };
    handleInitialPageLoad();
  },[]);
  
  if (isUserLoggedOut){
    return(<LogoutPopup />)
  };
  
  /* 
    I have chosen to use the passwords state to hold all passwords in an array and passSnip to hold all passwords that fit the users search input.
    The idea here is to allow the user to navigate their vault quicker by allowing them to instantly search their library as they type rather
    then having to press a search button after changing their search input to perform a search. This is more mobile friendly because some users may have
    issues pressing on smaller elements on the page.
  */
  return(
    <div className='vault'>
      <h3>Vault<img src={settingsGear} alt='settings menu' onClick={()=>{navigate('/vault/settings')}} /></h3>
      <div>
        <img src={searchIcon} alt='magnifying glass' />
        <input placeholder='' value={searchInput} onChange={(e)=>{setSearchInput(e.target.value)}} />
      </div>
      {
        passSnip.map((password)=>{return(<Password key={uuidGen()} vault={vault} password={password} setPasswords={setPasswords} />)})
      }
      <NewPasswordForm vault={vault} setPasswords={setPasswords} />
    </div>
  )
};