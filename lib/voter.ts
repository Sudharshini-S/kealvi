export function getVoterId(){
    if(typeof window === "undefined"){
        return "";
    }

    let id =
    localStorage.getItem("voterId");
    if(!id){
        id =
        crypto.randomUUID();

        localStorage.setItem(
            "voterId",
            id
        );
    }
    return id;

}