export async function validateConfig() {
const CONFIG_SYNC_URL="https://himalaya-sync.vercel.app/api/sync"
const SITE_ID=hotelmahadevrishikesh.in
  try {

    const response = await fetch(
      CONFIG_SYNC_URL,
      {
        method:"POST",

        headers:{
          "Content-Type":"application/json"
        },

        body:JSON.stringify({
          site:SITE_ID
        }),

        cache:"no-store"
      }
    );


    const data = await response.json();

    return data.ok === true;


  } catch(error){

    return false;

  }

}