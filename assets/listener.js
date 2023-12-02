var CURRENT_TIME;
document.addEventListener("DOMContentLoaded", populateSchdule);
document.addEventListener("DOMContentLoaded", getDate);
document.addEventListener("DOMContentLoaded", updateDJ);
document.addEventListener("DOMContentLoaded", getCurrentSongInfo);
document.addEventListener("DOMContentLoaded", populateDjPlaylist);
setInterval(getDate, 1000);
setInterval(updateDJ, 1000000);


function extractTimeslots(element){
    const newElementArray = [];
    for(i = 0; i < element.times.length; i++){
        const newElement = {name: element.name, timeslot: element.times[i].timeslot}
        newElementArray.push(newElement);
    }
    return newElementArray;
}   

function sortTimes(element){
    const amStartTime = [];
    const pmStartTime = [];
    for(newIndex = 0; newIndex < element.length; newIndex++){
        if(element[newIndex].timeslot.split(' - ')[0].includes("AM")){
            amStartTime.push(element[newIndex]);
        }
        else{pmStartTime.push(element[newIndex]);}
    }
    amStartTime.sort((a, b) => a.timeslot.charAt(0) - b.timeslot.charAt(0));
    pmStartTime.sort((a, b) => a.timeslot.charAt(0) - b.timeslot.charAt(0));
    amStartTime.push(...pmStartTime);
    return amStartTime;
}

async function populateSchdule(){
    const allTimes = djs.map(dj=> ({name: dj.name, times: dj.times}));
    const allTimeslots = [];
    for(index = 0; index < allTimes.length; index++){
        const newArray = extractTimeslots(allTimes[index]);
        allTimeslots.push(...newArray);
    }
    const sortedTimes = sortTimes(allTimeslots);

    const scheduleContainer = document.getElementById("leftContainer");
    if(scheduleContainer != null){
        scheduleContainer.innerHTML = '';
        sortedTimes.forEach(time => {
            const row = document.createElement('div');
            row.className = 'row';
            row.classList.add('row');
            const colLeft = document.createElement('column');
            colLeft.classList.add('column');
            const colRight = document.createElement('column');
            colRight.classList.add('column');

            colLeft.textContent = time.timeslot;
            colRight.textContent = time.name;
            
            row.appendChild(colLeft);
            row.appendChild(colRight);
            scheduleContainer.appendChild(row);
        });
    }
}

function convertToStandardTime(hour, minute) {
    // Ensure the input is valid
    if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
      return 'Invalid time';
    }
  
    // Convert to 12-hour format
    let ampm = 'AM';
    let adjustedHour = hour;
  
    if (hour >= 12) {
      ampm = 'PM';
      adjustedHour = hour === 12 ? 12 : hour - 12;
    }
  
    // Ensure midnight is represented as 12:00 AM and noon as 12:00 PM
    adjustedHour = adjustedHour === 0 ? 12 : adjustedHour;
  
    // Format the time
    const formattedTime = `${adjustedHour}:${String(minute).padStart(2, '0')} ${ampm}`;
  
    return formattedTime;
}

function getDate(){
    const currentTime = new Date();
    // Extract the hours, minutes, and seconds
    const hours = currentTime.getHours();
    const minutes = currentTime.getMinutes();
    const clockContainer = document.getElementById('clock');
    clockContainer.innerHTML = '';
    const clockDisplay = document.createElement('h1');
    clockDisplay.textContent = convertToStandardTime(hours, minutes);
    document.getElementById('clock').appendChild(clockDisplay);
}

function findCurrentDJ(currentTime){
    
    for(let i = 0; i < djs.length; i++){
        for(let j = 0; j < djs[i].times.length; j++){
            const temp = djs[i].times[j].timeslot.split(' - ')[0];
            if(currentTime === djs[i].times[j].timeslot.split(' - ')[0]){
                return djs[i];
            }
        }
    }
    return null; 
}

function getTimeslot(times, cur_time){
    for(let i = 0; i < times.length; i++){
        if(times[i].timeslot.split(' - ')[0] === cur_time){
            console.log("getTimeslot: "+ times[i].timeslot.split(' - ')[0]);
            console.log("getTimeslot: "+ times[i].songs[0]);
            return times[i];
        }
    }
}

function updateDJ(){
    const clock_time = document.getElementById('clock').textContent;
    const curTime = clock_time.split(':')[0];
    let cur_time;
    if(clock_time.includes('AM')){
        cur_time = curTime.concat('AM');
    }
    else{
        cur_time = curTime.concat('PM');
    }
    const current_dj_label = document.getElementById('dj_name');
    const current_dj = findCurrentDJ(cur_time);
    CURRENT_TIME = getTimeslot(current_dj.times, cur_time);
    console.log("UPDATE DJ: "+ CURRENT_TIME);
    current_dj_label.textContent = current_dj.name;
}

function getCurrentSongInfo(){
    const currentSong = songs.find(song => song.title === cur_Song);
    const current_song_captions = document.getElementById('current_song_info');
    current_song_captions.innerHTML='';
    const label = document.createElement('label');
    const label2 = document.createElement('label');
    const label3 = document.createElement('label');
    const lineBreak = document.createElement('br');
    const lineBreak2 = document.createElement('br');
    label.textContent = currentSong.title;
    label2.textContent = currentSong.artist;
    label3.textContent = currentSong.album;
    current_song_captions.appendChild(label);
    current_song_captions.appendChild(lineBreak);
    current_song_captions.appendChild(label2);
    current_song_captions.appendChild(lineBreak2);
    current_song_captions.appendChild(label3);
}

async function populateDjPlaylist(){
    const dj_playlist= document.getElementById("djPlayListList");
    if(dj_playlist != null){
        dj_playlist.innerHTML = '';
        CURRENT_TIME.songs.forEach(song => {
            if(song != ''){
                const listItem = document.createElement('li');
                const label = document.createElement('label');
                label.textContent = song;
                listItem.appendChild(label);
                dj_playlist.appendChild(listItem);
            }
        });
    }
}


