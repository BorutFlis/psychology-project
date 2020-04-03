
var mdict = {};
var randint;
var randstimuli;
var task_id; 


//var ManipulationsKeys = {
//    AudioInterval: 'audioInterval'
//}

//var audioInterval = gorilla.manipulation(ManipulationsKeys.AudioInterval, 'Fixed');

mdict = {
	0:'0.mp3',
	1:'1.mp3',
	2:'2.mp3',
	3:'3.mp3',
	4:'4.mp3',
	5:'5.mp3',
	6:'6.mp3',
	7:'7.mp3',
	8:'8.mp3',
	9:'9.mp3'
};

function input_validation(i){
	if(i!="y" && i!="n" && i!="Y" && i!="N"){
		i=prompt("Invalid input, you can only input Y or N. Was the last number the same as the one two steps ago? Y-Yes/N-No");
		return input_validation(i);
	}else{
		return i;
	}
}

function myTimer() {
	var auditoryRoundNumber = gorilla.retrieve("auditoryRoundNumber", 0);
	console.log("arn "+auditoryRoundNumber);
	const queue = [];
	var two_back=gorilla.retrieve("two_back", queue);
	
	if(auditoryRoundNumber<2){
		//console.log(auditoryRoundNumber);
		randint= Math.floor(Math.random() * 10);
	}else{
		//after the first two trials we assign a higher probability to the digit that happen two trials ago.
		
		//We make a draw in 50% of the cases it is a random digit in the other 50% it is the two back
		var draw=Math.random();
		if(draw>0.5){
			randint= Math.floor(Math.random() * 10);
		}else{
			randint= two_back[0];
			//console.log(randint);
		}
	}
	two_back.push(randint);
	randstimuli=gorilla.stimuliURL(mdict[randint]);
	//console.log(randstimuli);
	var audio = new Audio(randstimuli);
	audio.play();
	//var interval=5000;//(audioInterval=="Fixed") ? 5000 : Math.floor(Math.random() * 5000)+1000;

	audio.onended=function(){
		auditoryRoundNumber=auditoryRoundNumber+1;
		gorilla.store("auditoryRoundNumber",auditoryRoundNumber);
		//In the first two trial we do not ask what is the number two steps ago.
		if(auditoryRoundNumber>2){
			var start=Date.now();
			var ans=prompt("Was the last number the same as the one two steps ago? Y-Yes/N-No");
			ans=input_validation(ans);
			//console.log(two_back.length); 
			ans=(ans=="y"||ans=="Y")? 1: 0;
			//We remove the first item from the queue other items get reindexed
			two_back_ans= two_back.shift();
			//console.log(two_back_ans+" "+ (ans==two_back_ans)? 1:0);
			gorilla.metric({
				current_int: randint,
				two_back_int: two_back_ans,
				response_audio: ans,
				audio_correct: (ans==(randint==two_back_ans))? 1:0,//expressions to evaluate similarity between ans and 2-back
				audio_RT: Date.now()-start
			});
			//console.log(auditoryRoundNumber);
			
			if(auditoryRoundNumber>= NoOfAudioTrials+2){
				return;
			}
		}else{
			gorilla.metric({
				current_int: randint,
			});
		}
		gorilla.store("two_back", two_back);
		task_id=setTimeout(myTimer,5000);
	}
}