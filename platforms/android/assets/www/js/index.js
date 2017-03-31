/*****************************************************************
File: index.js
Author: Priscila Ribas da Costa
Description: 
    MAD9022 Assignment - GiftR App.
    Lists contacts ordered by date of birth and gifts ideas for each contact
Version: 0.0.1
Updated: Mar 31, 2017

*****************************************************************/
'use strict';
var app = {
    
    /*
     *  local storage manipulation
     */
    localData : {
        
        /*gets data from local storage*/
        getLocalStorageData : function() {
            
            if ( localStorage ) {
                
                //get local storage data
                let lsData = localStorage.getItem('giftr-riba0007');

                //if does not exists create a new object. If exists parse to json
                if ( !lsData ) {
                    
                    lsData = this.initPeopleList();
                
                } else {
                    
                    lsData = JSON.parse( lsData );

                    //check if lsData is correct
                    if ( lsData.settings == null || lsData.settings.app != "giftr" ){
                        
                        lsData = this.initPeopleList();
                    }
                }
                //returns json data
                return lsData;
            }
            //return an empty object if local storage not available
            return {};
        },

        /*saves data on local storage*/
        saveLocalStorageData : function( lsData ) {
            
            if ( localStorage ){
                
                if ( !lsData ){
                    
                    //gets local storage data. retuns a new object if still does not exists
                    lsData = this.getLocalStorageData();
                }
                
                //saves on local storage
                localStorage.setItem( 'giftr-riba0007' , JSON.stringify( lsData ) ); 
            }
        },

        /*creates or updates a contact and saves on local storage*/
        savePerson : function ( name = "" , dob = "1900-01-01" , id = 0 ) {
            
            let lsData = this.getLocalStorageData();
            
            //if data does not exists creates a new object
            if ( !lsData ) {
                
                lsData = this.initPeopleList();
            }
            
            //gets dob timestamp to save on local storage
            dob = moment(dob, "YYYY-MM-DD").valueOf();
            
            //updates a contact
            if ( id && this.getPersonById( id ) ) {
                
                lsData.people = lsData.people.map( function( item ) {
                    
                    return item.id == id ? { id , name , dob , "ideas" : item.ideas } : item ;
                });           
            //creates a new contact
            } else {
                
                lsData.people.push({ "id" : Date.now() , name , dob , "ideas" : [] });  
            }
            
            //sort by month and day only.
            lsData.people = this.sortByMonthDay( lsData.people ); 
            
            //saves on local storage
            this.saveLocalStorageData( lsData );
        },
        
        /*saves a new idea on local storage*/
        saveIdea : function( personId , idea , store , url , cost ){
            
            let lsData = this.getLocalStorageData();
            
            //searchs for the right person and adds new idea into ideas array
            lsData.people = lsData.people.map( function( item ) {
                
                if ( item.id == personId ) {
                    
                    item.ideas.push( { "id" : Date.now() , idea , store , url , cost } );
                }
                
                return item;
            });
          
            //saves on local storage
            this.saveLocalStorageData( lsData );
        },
        
        /*removes an idea from array of ideas and save on local storage*/
        removeIdea : function( personId , ideaId ) {
            
            //if ids
            if ( personId && ideaId ) {
                
                let lsData = this.getLocalStorageData();
                
                //searchs for the right person and removes the right idea from ideas array
                lsData.people = lsData.people.map( function( item ) {
                
                    if ( item.id == personId ) {

                        item.ideas = item.ideas.filter( idea => idea.id == ideaId ? false : true );
                    }

                    return item;
                });

                //saves on local storage
                this.saveLocalStorageData( lsData );
            }
        },
        
        /*initializes the object to be saved on local storage*/
        initPeopleList : function() {
            
            return { "settings" : { "app" : "giftr" } , "people" : [] }
        },

        /*return a person object from local storage with same id*/
        getPersonById : function( id ) {
            
            let person = {};
            
            if ( id ) {
            
                let lsData = this.getLocalStorageData();
                
                //if local data exists search for the right id
                if ( lsData && lsData.people ) {
                    
                    person = lsData.people.filter( item => item.id == id ? true : false )[0];
                }
            } 
                
            return person;
        },
        
        /*returns an array of people ordered by date of birth*/
        sortByYearMonthDay : function( people ) {
            
            return people.sort( ( a, b ) => a.dob < b.dob ? -1 : a.dob > b.dob ? 1 : 0 );
        },
        
        /*returns an array of people ordered by month and day of birth*/
        sortByMonthDay : function( people ) {
            
            return people.sort( function ( a, b ) {
                 
                let ma = moment( a.dob ).set( "year" , moment().year() );
                        
                let mb = moment( b.dob ).set( "year" , moment().year() );
                
                return ma < mb ? -1 : ma > mb ? 1 : 0;
           });
        }
    },
    
    /*
     *  index.html manipulation
     */
    contactsPage : {
        
        //saves the id being edited
        contactId : 0,
        
        /*shows on browser all contacts from local storage*/
        drawContactList : function( contactList = [] ) {
        
            //clears the current list
            document.getElementById( "contact-list" ).innerHTML = "";
            
            //for each contact creates a list item to add to the list
            contactList.forEach( function( contact ) {
                
                let li = document.createElement( "li" );
                
                li.className = "table-view-cell";
                
                let dob = moment( contact.dob ).set( "year" , moment().year() );
                
                li.innerHTML = "".concat( '<span class="name"><a href="#personModal">' , contact.name , '</a></span>' ,  
                                          '<a class="navigate-right pull-right" href="gifts.html">' , 
                                             '<span ' + ( dob < moment() ? 'class="dob"' : "" ) + '>' , dob.format( "MMMM Do" ) , '</span>' ,
                                          '</a>');
                
                //adds Event listeners
                li.querySelector( "span a" ).addEventListener( "touchend" , () => app.contactsPage.openModal( contact.id ) );
                
                li.querySelector( "a.navigate-right.pull-right" ).addEventListener( "touchend" , () => app.giftsPage.contactId = contact.id );
                
                //adds item to the list
                document.getElementById( "contact-list" ).appendChild(li);
            });
        },
        
        /*saves or updates a contact*/
        saveContact : function(){
            
            //gets data from screen 
            let name = document.getElementById( "contact_name" ).value.trim();
            
            let dob = document.getElementById( "contact_dob" ).value.trim();
            
            //validates data
            !name ? app.showMessage( "Please fill 'FULL NAME' first" ) : 0;
            !dob ? app.showMessage( "Please fill 'D.O.B.' first" ) : 0;
            
            if ( name && dob ) {
                
                //saves on local storage
                app.localData.savePerson( name , dob , app.contactsPage.contactId );
                
                //recreates contact list
                app.contactsPage.drawContactList( app.localData.getLocalStorageData().people );
                
                //closes modal
                app.contactsPage.closeModal();
            }
        },
        
        /*opens modal to add or edit contact*/
        openModal : function( contactId ) {
            
            //if edit
            if ( contactId ) {
                
                let contact = app.localData.getPersonById( contactId );
                
                //if contact exists fills inputs with data
                if ( contact ) {
                    
                    this.contactId = contactId;
                    
                    document.getElementById( "contact_name" ).value = contact.name;
            
                    document.getElementById( "contact_dob" ).value = moment(  contact.dob ).format( "YYYY-MM-DD" );
                    
                    //changes header
                    document.querySelector( "#personModal header h1" ).textContent = "Edit: "+ contact.name;
                }
            }
        },
        
        /*cleans modals fields*/
        cleanModal : function() {
            
            app.contactsPage.contactId = 0;
            
            document.getElementById( "contact_name" ).value = "";
            
            document.getElementById( "contact_dob" ).value = "";
            
            document.querySelector( "#personModal header h1" ).textContent = "New Person"; 
        },
        
        /*cleans modal calls close event*/
        closeModal : function() {
            
            app.contactsPage.cleanModal();
            
            document.getElementById( "close_contact" ).dispatchEvent( new CustomEvent( "touchend" , { bubbles: true, cancelable: true } ) );
        }
    },
    
    /*
     *  gifts.html manupulation
     */
    giftsPage : {
        //variables to store data being edited
        giftId : 0,
        
        contactId : 0,
        
        /*shows on browser all gifts idas from a contact*/
        drawGiftsList : function( giftList = [] ) {
        
            //clears current list
            document.getElementById( "gift-list" ).innerHTML = "";
            
            //for each gift idea
            giftList.forEach( function( gift ) {

                //checks if url starts with http:// or https://. If not adds it to url
                let url = /^(http|https):\/\//.test( gift.url ) ? "" : "http://" + gift.url;
                
                //creates a new list item
                let li = document.createElement( "li" );
                
                li.className = "table-view-cell media";
                
                //inner html
                li.innerHTML = "".concat( '<span class="pull-right icon icon-trash midline"></span>' ,
                                          '<div class="media-body">' , gift.idea ,
                                            ( gift.store ? '<p>at ' + gift.store + '</p>' : "" ) ,
                                            ( gift.url ? '<a href="'+ url +'" target="_blank" >' + gift.url + '</a>' : "" ) ,
                                            ( gift.cost ? '<p>' + ( /^\$/.test(gift.cost) ? "" : "$" ) + gift.cost + '</p>' : "" ) ,
                                          '</div>');
                
                //adds event listeners
                li.querySelector( "span" ).addEventListener( "click" , () => app.giftsPage.removeGiftIdea( gift.id ) );
                
                //adds list item to the list
                document.getElementById( "gift-list" ).appendChild(li);
            });
        },
        
        /*prepares gift page to be open*/
        openGiftPage : function() {
            
            //searchs contact on local storage
            let contact = app.localData.getPersonById( app.giftsPage.contactId );
            
            //if contact exists
            if ( contact ) {
                
                //creates ideas list
                app.giftsPage.drawGiftsList( contact.ideas ); 
                
                //changes headers
                document.querySelector( "#giftModal div p" ).textContent = "New idea for " + contact.name;
                
                document.querySelector( ".content h5" ).textContent = "Ideas for " + contact.name;
            }
        },
        
        /*saves a new idea on local storage*/
        saveGiftIdea : function(){
            
            //gets inputs values
            let idea = document.getElementById( "gift_idea" ).value.trim();
            
            let store = document.getElementById( "gift_store" ).value.trim();
            
            let url = document.getElementById( "gift_url" ).value.trim();
                
            let cost = document.getElementById( "gift_cost" ).value.trim();
            
            //validates 
            !idea ? app.showMessage( "please fill 'IDEA first'" ) : 0;
            
            if ( idea ) {
                
                //saves on local storage
                app.localData.saveIdea( app.giftsPage.contactId , idea , store , url , cost );
                
                //redraws list items
                app.giftsPage.drawGiftsList( app.localData.getPersonById( app.giftsPage.contactId ).ideas );
                
                //closes modal
                app.giftsPage.closeModal();
            }
        },
        
        /*removes an ideia from local storage and redraws ideas list*/
        removeGiftIdea : function( id ){
          
            //removes from local storage
            app.localData.removeIdea( app.giftsPage.contactId , id );
            
            //search contact
            let contact = app.localData.getPersonById( app.giftsPage.contactId );
            
            if ( contact ) {
                
                //redraws ideas list
                app.giftsPage.drawGiftsList( contact.ideas ); 
            }
        },
        
        /*clean values from modal window*/
        cleanModal : function() {
            
            //app.giftsPage.giftId = 0;
            
            document.getElementById( "gift_idea" ).value = "";
            
            document.getElementById( "gift_store" ).value = "";
            
            document.getElementById( "gift_url" ).value = "";
                
            document.getElementById( "gift_cost" ).value = "";
        },
        
        /*cleans and closes modal*/
        closeModal : function() {
            
            //cleans modal
            app.giftsPage.cleanModal();
            
            //calls close event
            document.getElementById( "close_gift" ).dispatchEvent( new CustomEvent( "touchend" , { bubbles: true, cancelable: true } ) );
        }
    },

    /*shows a message on the top of the modal window*/
    showMessage : function (msg) {
        
        let content = document.querySelector(".modal .content .content-padded");
        
        let main = document.querySelector(".modal .content");
        
        let div = document.createElement("div");
        
        div.className = "msg";
        
        //adds opacity
        setTimeout( (function( c, d ){
            
            return function(){
                
                div.classList.add("load");
            
            }
        })( content , div ), 50);
        
        div.textContent = msg;
        
        main.insertBefore(div, content);
        
        //removes msg
        setTimeout( (function( c, d ){
            
            return function(){
                //opacity
                div.classList.remove("load");
                
                //removes from screen
                setTimeout( (function( c, d ){
            
                    return () => main.removeChild( div );
                    
                })( content , div ), 400);
            }
        })( content , div ), 3000);
    },
    
    /*push event*/
    pageChanged : function() {
        
        //if index.html
        if( location.pathname.indexOf( "index.html" ) != -1 ){
            
            app.contactsPage.drawContactList( app.localData.getLocalStorageData().people );
            
            document.getElementById( "save_contact" ).addEventListener( "touchend" , app.contactsPage.saveContact );
            
            document.getElementById( "cancel_contact" ).addEventListener( "touchend" , app.contactsPage.closeModal );
            
            document.getElementById( "close_contact" ).addEventListener( "touchend" , app.contactsPage.cleanModal );
        
        //if gifts.html
        } else {
            
            app.giftsPage.openGiftPage();
          
            document.getElementById( "save_gift" ).addEventListener( "touchend" , app.giftsPage.saveGiftIdea );
            
            document.getElementById( "cancel_gift" ).addEventListener( "touchend" , app.giftsPage.closeModal );
            
            document.getElementById( "close_gift" ).addEventListener( "touchend" , app.giftsPage.cleanModal );
        }
    },
    
    /*method called to initialize the app*/
    onDeviceReady : function() {
         
        //set up event listeners and default variable values
        window.addEventListener(  'push', app.pageChanged );
        
        //set moment locale
        moment.locale('en-ca');
        
        app.pageChanged();
    },
    
    /* Application Constructor*/
    initialize : function() {
        
        document.addEventListener( 'deviceready' , this.onDeviceReady.bind(this) , false );
    }
};

//app.initialize();
app.onDeviceReady();