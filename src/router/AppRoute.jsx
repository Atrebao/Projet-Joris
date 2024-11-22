import React from 'react'
import { createHashRouter } from "react-router-dom";
import {HOMECLIENT} from "../Utils/Utils"
import {HOMEADMIN} from "../Utils/Utils"
import LayoutClient from "../layout/LayoutClient"
import LayoutAdmin from "../layout/LayoutAdmin"
import Home from "../pages/Home"
import Abonnement from '../pages/AbonnementDetails';
import Conditions from '../pages/Conditions';
import Login from "../pages/Login"
import HomeAdmin from '../pages/HomeAdmin';
import Abonnements from '../pages/Abonnements';
import Utilisateurs from '../pages/Utilisateurs';
import Stats from '../pages/Stats';
import Identifiants from '../pages/Identifiants';
import Souscription from '../pages/Souscription';
import Clients from '../pages/Clients';

export const AppRoute = createHashRouter([
    {
        path : "/",
        element :<LayoutClient/>,
        children:[
            
           {
            path: "/",
            element :<Home/>
           },
           {
            path : "/abonnement/:id",
            element : <Abonnement/>
           },
           {
            path : "/conditions",
            element : <Conditions/>
           }
        ]
    },
    {
        path: `${HOMEADMIN}/`,
        element :<LayoutAdmin/>,
        children : [
            {
                path:`${HOMEADMIN}/`,
                element : <Abonnements/>
            },
            {
                path:`${HOMEADMIN}/abonnements`,
                element : <Abonnements/>
            },
            {
                path:`${HOMEADMIN}/souscriptions`,
                element : <Souscription/>
            },
            {
                path:`${HOMEADMIN}/clients`,
                element : <Clients/>
            },
            {
                path:`${HOMEADMIN}/stats`,
                element : <Stats/>
            },
            {
                path:`${HOMEADMIN}/utilisateurs`,
                element : <Utilisateurs/>
            },
            {
                path:`${HOMEADMIN}/identifiants`,
                element : <Identifiants/>
            }

        ]
    },
    {
        path :`${HOMEADMIN}/login`,
        element : <Login/>
    },


   
])