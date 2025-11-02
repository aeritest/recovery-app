import React, { useState, useEffect } from 'react';
import { Calendar, Heart, BookOpen, Users, AlertCircle, Award, TrendingUp, Sparkles, Zap, ChevronRight, Shield, X } from 'lucide-react';

export default function RecoveryApp() {
  const [activeTab, setActiveTab] = useState('home');
  const [sobrietyDate, setSobrietyDate] = useState(null);
  const [urges, setUrges] = useState([]);
  const [journalEntries, setJournalEntries] = useState([]);
  const [accountability, setAccountability] = useState({ name: '', contact: '' });
  const [showUrgeLog, setShowUrgeLog] = useState(false);
  const [showJournal, setShowJournal] = useState(false);
  const [checkIns, setCheckIns] = useState([]);
  const [celebrating, setCelebrating] = useState(false);
  const [showGuidance, setShowGuidance] = useState(false);
  const [guidanceType, setGuidanceType] = useState('');
  const [blockerEnabled, setBlockerEnabled] = useState(false);
  
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [userProfile, setUserProfile] = useState({
    name: '',
    age: '',
    addictionYears: '',
    isReligious: null,
    religion: ''
  });

  useEffect(() => {
    const saved = localStorage.getItem('recoveryData');
    if (saved) {
      const data = JSON.parse(saved);
      setSobrietyDate(data.sobrietyDate);
      setUrges(data.urges || []);
      setJournalEntries(data.journalEntries || []);
      setAccountability(data.accountability || { name: '', contact: '' });
      setCheckIns(data.checkIns || []);
      setUserProfile(data.userProfile || userProfile);
      setBlockerEnabled(data.blockerEnabled || false);
      if (data.userProfile && data.userProfile.name) {
        setOnboardingStep(5);
      }
    }
    
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
    
    // Setup notifications
    setupNotifications();
  }, []);

  const setupNotifications = () => {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return;
    }

    // Schedule notifications throughout the day
    const scheduleNotification = (hour, minute, title, body) => {
      const now = new Date();
      const scheduledTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, minute, 0);
      
      if (scheduledTime < now) {
        scheduledTime.setDate(scheduledTime.getDate() + 1);
      }
      
      const timeUntilNotification = scheduledTime.getTime() - now.getTime();
      
      setTimeout(() => {
        if (Notification.permission === 'granted') {
          new Notification(title, {
            body: body,
            icon: '🛡️',
            badge: '💪',
            tag: 'recovery-reminder'
          });
        }
        // Reschedule for next day
        setTimeout(() => scheduleNotification(hour, minute, title, body), 24 * 60 * 60 * 1000);
      }, timeUntilNotification);
    };

    // Morning motivation (8 AM)
    scheduleNotification(8, 0, 
      `Good morning, ${userProfile.name || 'Champion'}!`, 
      "Start your day strong. You're on day " + getDayCount() + " of your journey! 💪"
    );

    // Midday check (12 PM)
    scheduleNotification(12, 0, 
      "How's your day going?", 
      "Remember: You are stronger than your urges. One moment at a time. 🌟"
    );

    // Afternoon reminder (3 PM)
    scheduleNotification(15, 0, 
      "Keep pushing forward!", 
      "You've made it this far today. Stay focused on your goals. 🎯"
    );

    // Evening encouragement (6 PM)
    scheduleNotification(18, 0, 
      "Evening check-in", 
      "Have you checked in today? Log your progress and celebrate your wins! ✨"
    );

    // Night reminder (9 PM)
    scheduleNotification(21, 0, 
      "Protect your evening", 
      "This is a vulnerable time. Stay strong and remember why you started. 🛡️"
    );

    // Check for missed check-ins
    const checkInInterval = setInterval(() => {
      const today = new Date().toDateString();
      const saved = localStorage.getItem('recoveryData');
      if (saved) {
        const data = JSON.parse(saved);
        const checkIns = data.checkIns || [];
        if (!checkIns.includes(today)) {
          if (Notification.permission === 'granted') {
            const now = new Date().getHours();
            if (now >= 20) { // After 8 PM
              new Notification("Don't forget to check in!", {
                body: "You haven't checked in today. Take a moment to log your progress! 📝",
                icon: '⏰',
                tag: 'checkin-reminder'
              });
            }
          }
        }
      }
    }, 60 * 60 * 1000); // Check every hour

    // Check for journal inactivity
    const journalInterval = setInterval(() => {
      const saved = localStorage.getItem('recoveryData');
      if (saved) {
        const data = JSON.parse(saved);
        const entries = data.journalEntries || [];
        if (entries.length === 0 || 
            (entries.length > 0 && new Date().getTime() - new Date(entries[0].timestamp).getTime() > 3 * 24 * 60 * 60 * 1000)) {
          if (Notification.permission === 'granted') {
            new Notification("Time to journal", {
              body: "Writing helps process your thoughts and strengthen your recovery. 📖",
              icon: '✍️',
              tag: 'journal-reminder'
            });
          }
        }
      }
    }, 24 * 60 * 60 * 1000); // Check daily
  };

  useEffect(() => {
    const data = { sobrietyDate, urges, journalEntries, accountability, checkIns, userProfile, blockerEnabled };
    localStorage.setItem('recoveryData', JSON.stringify(data));
  }, [sobrietyDate, urges, journalEntries, accountability, checkIns, userProfile, blockerEnabled]);

  const getDayCount = () => {
    if (!sobrietyDate) return 0;
    const start = new Date(sobrietyDate);
    const today = new Date();
    const diff = Math.floor((today - start) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset your counter? This will start a new journey.')) {
      setSobrietyDate(new Date().toISOString());
    }
  };

  const handleUrgeLog = (intensity) => {
    const newUrge = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      intensity,
      overcome: false
    };
    setUrges([newUrge, ...urges]);
    setShowUrgeLog(false);
  };

  const markUrgeOvercome = (id) => {
    setUrges(urges.map(u => u.id === id ? { ...u, overcome: true } : u));
    setCelebrating(true);
    setTimeout(() => setCelebrating(false), 2000);
  };

  const addJournalEntry = (text) => {
    const entry = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      text
    };
    setJournalEntries([entry, ...journalEntries]);
  };

  const dailyCheckIn = () => {
    const today = new Date().toDateString();
    if (!checkIns.includes(today)) {
      setCheckIns([...checkIns, today]);
      setCelebrating(true);
      setTimeout(() => setCelebrating(false), 2000);
      alert(`Great job checking in today, ${userProfile.name}! Keep going! 💪`);
    } else {
      alert('You already checked in today. See you tomorrow! 🌟');
    }
  };

  const handleGuidanceClick = (type) => {
    setGuidanceType(type);
    setShowGuidance(true);
  };

  const generatePrayer = () => {
    const prayers = [
      `Dear Heavenly Father,

I come before you in this moment of weakness, seeking your strength and guidance. I know that with you, all things are possible, and that your power is made perfect in my weakness.

Lord, help me to resist this temptation. Fill me with your Holy Spirit and give me the strength to turn away from what is not of you. Replace these thoughts with thoughts of purity, peace, and your love.

I claim your promise in 1 Corinthians 10:13 - that you will provide a way out of this temptation. Show me that way now, Father.

Thank you for your endless grace and mercy. I trust in your power to transform my heart and mind.

In Jesus' name, Amen.`,
      `Loving God,

In this moment of struggle, I turn to you. You know my heart, you know my battle, and you know the depth of my desire to live in freedom.

I confess my weakness to you, Lord. I cannot do this on my own. But I believe in your promise that when I am weak, then I am strong in you.

Break the chains that bind me. Renew my mind. Fill me with your Spirit. Help me to fix my eyes on what is pure, noble, and praiseworthy.

I thank you that you never condemn me, but always offer grace. Transform me from the inside out, Father.

In your holy name, Amen.`,
      `Gracious Father,

I cry out to you in this difficult moment. The battle feels overwhelming, but I know you are greater than any struggle I face.

Give me the strength to turn away right now. Help me remember that this temporary pleasure leads to lasting pain, but your way leads to lasting joy and peace.

Wash me clean, Lord. Create in me a pure heart and renew a right spirit within me. Let your love be so real to me that it satisfies every longing of my soul.

I trust in your power to save and deliver. Thank you for never giving up on me.

Through Christ my Savior, Amen.`,
      `Dear Lord Jesus,

I need you now more than ever. This temptation feels so strong, but I know you are stronger. You defeated sin and death, and you can help me overcome this moment.

Protect my mind, Lord. Guard my heart. Redirect my thoughts to things that honor you. Help me to remember who I am in you - redeemed, loved, and set apart.

I reject the lies that tell me this will satisfy me. Only you can truly satisfy. Fill me with your presence so completely that there is no room for this darkness.

Thank you for your patience with me. I choose you, Lord.

In your powerful name, Amen.`,
      `Almighty God,

I stand at a crossroads right now. One path leads to shame and bondage. The other leads to freedom and life. By your grace, help me choose life.

You have called me to holiness, Father. You have given me everything I need for life and godliness through your Holy Spirit. Activate that power in me now.

Remind me of your goodness. Show me the beauty of purity. Help me to hate what is evil and cling to what is good.

I am yours, Lord. My body is your temple. Help me honor you in this moment and every moment.

All glory to you, Amen.`
    ];
    return prayers[Math.floor(Math.random() * prayers.length)];
  };

  const generateScripture = () => {
    const scriptureGroups = [
      [
        { verse: "Philippians 4:8", text: "Finally, brothers and sisters, whatever is true, whatever is noble, whatever is right, whatever is pure, whatever is lovely, whatever is admirable—if anything is excellent or praiseworthy—think about such things." },
        { verse: "Romans 8:37", text: "No, in all these things we are more than conquerors through him who loved us." },
        { verse: "Psalm 51:10", text: "Create in me a pure heart, O God, and renew a steadfast spirit within me." },
        { verse: "James 4:7", text: "Submit yourselves, then, to God. Resist the devil, and he will flee from you." }
      ],
      [
        { verse: "1 Peter 5:8-9", text: "Be alert and of sober mind. Your enemy the devil prowls around like a roaring lion looking for someone to devour. Resist him, standing firm in the faith." },
        { verse: "Galatians 5:16", text: "So I say, walk by the Spirit, and you will not gratify the desires of the flesh." },
        { verse: "Matthew 5:8", text: "Blessed are the pure in heart, for they will see God." },
        { verse: "Proverbs 4:23", text: "Above all else, guard your heart, for everything you do flows from it." }
      ],
      [
        { verse: "2 Timothy 2:22", text: "Flee the evil desires of youth and pursue righteousness, faith, love and peace, along with those who call on the Lord out of a pure heart." },
        { verse: "1 Thessalonians 4:3-4", text: "It is God's will that you should be sanctified: that you should avoid sexual immorality; that each of you should learn to control your own body in a way that is holy and honorable." },
        { verse: "Hebrews 4:15-16", text: "For we do not have a high priest who is unable to empathize with our weaknesses, but we have one who has been tempted in every way, just as we are—yet he did not sin. Let us then approach God's throne of grace with confidence." },
        { verse: "Romans 6:12-14", text: "Therefore do not let sin reign in your mortal body so that you obey its evil desires. Do not offer any part of yourself to sin as an instrument of wickedness, but rather offer yourselves to God." }
      ],
      [
        { verse: "Psalm 119:11", text: "I have hidden your word in my heart that I might not sin against you." },
        { verse: "2 Corinthians 10:5", text: "We demolish arguments and every pretension that sets itself up against the knowledge of God, and we take captive every thought to make it obedient to Christ." },
        { verse: "Colossians 3:5", text: "Put to death, therefore, whatever belongs to your earthly nature: sexual immorality, impurity, lust, evil desires and greed, which is idolatry." },
        { verse: "1 John 1:9", text: "If we confess our sins, he is faithful and just and will forgive us our sins and purify us from all unrighteousness." }
      ],
      [
        { verse: "Psalm 139:23-24", text: "Search me, God, and know my heart; test me and know my anxious thoughts. See if there is any offensive way in me, and lead me in the way everlasting." },
        { verse: "Romans 12:1-2", text: "Therefore, I urge you, brothers and sisters, in view of God's mercy, to offer your bodies as a living sacrifice, holy and pleasing to God. Do not conform to the pattern of this world, but be transformed by the renewing of your mind." },
        { verse: "Ephesians 5:3", text: "But among you there must not be even a hint of sexual immorality, or of any kind of impurity, or of greed, because these are improper for God's holy people." },
        { verse: "1 Corinthians 6:18-20", text: "Flee from sexual immorality. All other sins a person commits are outside the body, but whoever sins sexually, sins against their own body. Do you not know that your bodies are temples of the Holy Spirit?" }
      ]
    ];
    
    const selectedGroup = scriptureGroups[Math.floor(Math.random() * scriptureGroups.length)];
    return selectedGroup.map(s => `${s.verse}\n"${s.text}"`).join('\n\n');
  };

  const generateExercise = () => {
    const exercises = [
      {
        title: "HIIT Blast",
        content: `High-intensity interval training to burn off that energy FAST.

Do each exercise for 45 seconds, rest 15 seconds:
• Burpees
• Mountain climbers
• High knees running in place
• Jump squats
• Push-ups
• Plank jacks

Repeat 2-3 rounds. Push yourself HARD. The goal is to get your heart pounding and mind focused on something else.`,
        action: "Start NOW. Set a timer and don't stop until you complete at least 2 rounds!"
      },
      {
        title: "Strength Circuit",
        content: `Build your strength while breaking the urge cycle.

Complete this circuit 3 times:
• 25 push-ups (modify on knees if needed)
• 40 squats
• 30 second wall sit
• 20 tricep dips (use a chair)
• 15 burpees
• 1 minute plank

Rest 1 minute between circuits. Focus on form and pushing yourself.`,
        action: "Drop and start with those push-ups RIGHT NOW!"
      },
      {
        title: "Cardio Crusher",
        content: `Get your blood pumping with this cardio routine.

Do this for 15 minutes:
• 2 minutes: Run in place (high intensity)
• 1 minute: Jumping jacks
• 2 minutes: Sprint in place
• 1 minute: Jump rope (or mimick the motion)
• Repeat until 15 minutes is up

If you can go outside, sprint intervals are even better - 30 seconds sprint, 30 seconds walk, repeat 15 times.`,
        action: "Lace up those shoes and START MOVING. Now is the time!"
      },
      {
        title: "Core Destroyer",
        content: `Channel that energy into building an iron core.

Complete 4 rounds:
• 30 crunches
• 20 bicycle crunches (10 each side)
• 30 second plank
• 20 leg raises
• 20 Russian twists
• 30 second side plank (each side)
• 15 V-ups

No rest between exercises. 1 minute rest between rounds.`,
        action: "Get on the floor and start those crunches NOW!"
      },
      {
        title: "Full Body Burn",
        content: `Hit every muscle group to exhaust your body and mind.

Do 3 rounds of:
• 20 burpees
• 30 squats
• 20 push-ups
• 30 lunges (15 each leg)
• 20 mountain climbers
• 30 second plank
• 20 jump squats

This should take 20-25 minutes. Push through the burn!`,
        action: "Begin with those burpees. Do it NOW before your mind talks you out of it!"
      },
      {
        title: "Bodyweight Blaster",
        content: `No equipment needed - just you versus your own body weight.

Set a timer for 20 minutes and do as many rounds as possible:
• 10 push-ups
• 15 squats
• 10 sit-ups
• 10 lunges (5 each leg)
• 10 burpees
• 30 second plank

Track how many rounds you complete. Try to beat it next time!`,
        action: "Timer set? GO! Start with those push-ups!"
      }
    ];
    return exercises[Math.floor(Math.random() * exercises.length)];
  };

  const getGuidanceContent = () => {
    if (guidanceType === 'pray') {
      if (userProfile.isReligious) {
        return {
          title: "Prayer for Strength",
          content: generatePrayer(),
          action: "Take a moment to pray this aloud, then sit in silence for 2 minutes listening for God's peace."
        };
      } else {
        const meditations = [
          `Take a moment to center yourself:

1. Find a quiet space and sit comfortably
2. Close your eyes and take 5 deep breaths
3. Acknowledge the urge without judgment
4. Remind yourself: "This feeling is temporary. I am stronger than this moment."
5. Visualize yourself 24 hours from now, proud of overcoming this
6. Continue breathing slowly for 2-3 minutes

You've got this. The urge will pass.`,
          `Ground yourself in this present moment:

1. Sit or stand comfortably
2. Notice 5 things you can see
3. Notice 4 things you can touch
4. Notice 3 things you can hear
5. Notice 2 things you can smell
6. Notice 1 thing you can taste
7. Take 10 slow, deep breaths
8. Repeat this affirmation: "I choose freedom. I choose myself. I choose life."

The urge is just a feeling. It will pass.`,
          `Practice this mindful breathing:

1. Sit comfortably with your back straight
2. Breathe in slowly for 4 counts
3. Hold for 4 counts
4. Breathe out slowly for 6 counts
5. Repeat for 5 minutes
6. Each time your mind wanders, gently bring it back to your breath
7. Visualize the urge as a wave - it rises, peaks, and falls

You are not your urges. You are the observer of them.`
        ];
        return {
          title: "Mindful Meditation",
          content: meditations[Math.floor(Math.random() * meditations.length)],
          action: "Set a 3-minute timer and follow the steps above. Focus on your breathing."
        };
      }
    }
    
    if (guidanceType === 'scripture') {
      return {
        title: "Verses for Strength",
        content: generateScripture(),
        action: "Read these verses slowly, three times. Memorize one that speaks to you most."
      };
    }
    
    if (guidanceType === 'exercise') {
      const workout = generateExercise();
      return {
        title: workout.title,
        content: workout.content,
        action: workout.action
      };
    }
    
    const guidance = {
      walk: {
        title: "Take a Walk",
        content: `Physical movement is one of the best ways to reset your mind and body.

What to do:
• Step outside immediately (even if it's just around your building)
• Walk briskly for at least 10-15 minutes
• Focus on your surroundings - notice trees, sky, people
• Take deep breaths of fresh air
• Listen to uplifting music or a podcast
• Don't return until you feel calmer

Remember: The urge loses power when you change your environment.`,
        action: "Put on your shoes and step outside RIGHT NOW. Don't wait."
      },
      shower: {
        title: "Cold Shower Technique",
        content: `A cold shower can instantly reset your nervous system and break the urge cycle.

How to do it:
• Start with warm water for 1 minute
• Gradually turn it colder
• Finish with 30-60 seconds of cold water
• Focus on the sensation - it forces you into the present moment
• Take deep breaths while under the cold water
• Dry off and put on fresh clothes

The shock of cold water interrupts the urge pattern in your brain.`,
        action: "Go to your bathroom now. The discomfort of the cold is worth your freedom."
      },
      meditate: {
        title: "Meditation Exercise",
        content: `Use this 5-minute meditation to calm your mind:

1. Sit comfortably, close your eyes
2. Set a timer for 5 minutes
3. Focus on your breath - in through nose, out through mouth
4. When thoughts arise, acknowledge them and let them pass like clouds
5. If the urge comes to mind, don't fight it - observe it without judgment
6. Return focus to your breath
7. With each exhale, imagine releasing the tension

This isn't about stopping thoughts - it's about not engaging with them.`,
        action: "Find a quiet space and meditate for 5 minutes. Use a timer."
      }
    };

    return guidance[guidanceType] || guidance.walk;
  };

  const bibleQuotes = [
    { verse: "1 Corinthians 10:13", text: "No temptation has overtaken you except what is common to mankind. God is faithful; he will not let you be tempted beyond what you can bear." },
    { verse: "Philippians 4:13", text: "I can do all things through Christ who strengthens me." },
    { verse: "2 Corinthians 5:17", text: "Therefore, if anyone is in Christ, the new creation has come: The old has gone, the new is here!" },
    { verse: "Psalm 119:9", text: "How can a young person stay on the path of purity? By living according to your word." },
    { verse: "James 1:12", text: "Blessed is the one who perseveres under trial because, having stood the test, that person will receive the crown of life." },
    { verse: "Romans 12:2", text: "Do not conform to the pattern of this world, but be transformed by the renewing of your mind." },
    { verse: "Galatians 5:1", text: "It is for freedom that Christ has set us free. Stand firm, then, and do not let yourselves be burdened again by a yoke of slavery." }
  ];

  const secularQuotes = [
    "You are stronger than your urges.",
    "Every day clean is a victory.",
    "Progress, not perfection.",
    "You deserve a life of freedom.",
    "One day at a time.",
    "Your future self will thank you.",
    "The struggle you're in today is developing the strength you need for tomorrow."
  ];

  const getRandomQuote = () => {
    if (userProfile.isReligious && userProfile.religion) {
      const quote = bibleQuotes[Math.floor(Math.random() * bibleQuotes.length)];
      return { text: quote.text, source: quote.verse };
    }
    return { text: secularQuotes[Math.floor(Math.random() * secularQuotes.length)], source: null };
  };

  const [currentQuote] = useState(getRandomQuote());

  if (onboardingStep < 5) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-6 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE4YzAtOS45NC04LjA2LTE4LTE4LTE4UzAgOC4wNiAwIDE4YzAgOS45NCA4LjA2IDE4IDE4IDE4czE4LTguMDYgMTgtMTh6bTEwIDEwYzAtNS41Mi00LjQ4LTEwLTEwLTEwcy0xMCA0LjQ4LTEwIDEwIDQuNDggMTAgMTAgMTAgMTAtNC40OCAxMC0xMHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30"></div>
        
        <div className="bg-white/10 backdrop-blur-2xl rounded-3xl shadow-2xl p-8 max-w-md w-full border border-white/20 transform hover:scale-105 transition-all duration-500 relative z-10 animate-fadeIn">
          {onboardingStep === 0 && (
            <div className="text-center">
              <Award className="w-20 h-20 mx-auto text-yellow-300 mb-4 animate-bounce" />
              <h1 className="text-4xl font-bold text-white mb-3">Welcome</h1>
              <p className="text-indigo-200 text-lg mb-8">Let's personalize your recovery journey. This will only take a minute.</p>
              <button
                onClick={() => setOnboardingStep(1)}
                className="w-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white py-4 rounded-2xl font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
              >
                Get Started <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {onboardingStep === 1 && (
            <div>
              <h2 className="text-3xl font-bold text-white mb-3">What's your name?</h2>
              <p className="text-indigo-200 mb-6">We'll use this to personalize your experience.</p>
              <input
                type="text"
                value={userProfile.name}
                onChange={(e) => setUserProfile({...userProfile, name: e.target.value})}
                className="w-full px-5 py-4 bg-white/20 border border-white/30 rounded-2xl text-white placeholder-indigo-200 text-lg mb-6 focus:ring-2 focus:ring-purple-400 transition-all duration-300"
                placeholder="Enter your name"
                autoFocus
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setOnboardingStep(0)}
                  className="flex-1 bg-white/10 text-white py-3 rounded-2xl font-semibold hover:bg-white/20 transition-all duration-300"
                >
                  Back
                </button>
                <button
                  onClick={() => userProfile.name && setOnboardingStep(2)}
                  disabled={!userProfile.name}
                  className="flex-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white py-3 px-6 rounded-2xl font-bold hover:shadow-2xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  Next <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {onboardingStep === 2 && (
            <div>
              <h2 className="text-3xl font-bold text-white mb-3">How old are you?</h2>
              <p className="text-indigo-200 mb-6">This helps us understand your journey better.</p>
              <input
                type="number"
                value={userProfile.age}
                onChange={(e) => setUserProfile({...userProfile, age: e.target.value})}
                className="w-full px-5 py-4 bg-white/20 border border-white/30 rounded-2xl text-white placeholder-indigo-200 text-lg mb-6 focus:ring-2 focus:ring-purple-400 transition-all duration-300"
                placeholder="Enter your age"
                autoFocus
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setOnboardingStep(1)}
                  className="flex-1 bg-white/10 text-white py-3 rounded-2xl font-semibold hover:bg-white/20 transition-all duration-300"
                >
                  Back
                </button>
                <button
                  onClick={() => userProfile.age && setOnboardingStep(3)}
                  disabled={!userProfile.age}
                  className="flex-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white py-3 px-6 rounded-2xl font-bold hover:shadow-2xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  Next <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {onboardingStep === 3 && (
            <div>
              <h2 className="text-3xl font-bold text-white mb-3">How long have you struggled?</h2>
              <p className="text-indigo-200 mb-6">Approximately how many years have you been dealing with this?</p>
              <input
                type="number"
                value={userProfile.addictionYears}
                onChange={(e) => setUserProfile({...userProfile, addictionYears: e.target.value})}
                className="w-full px-5 py-4 bg-white/20 border border-white/30 rounded-2xl text-white placeholder-indigo-200 text-lg mb-6 focus:ring-2 focus:ring-purple-400 transition-all duration-300"
                placeholder="Years"
                autoFocus
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setOnboardingStep(2)}
                  className="flex-1 bg-white/10 text-white py-3 rounded-2xl font-semibold hover:bg-white/20 transition-all duration-300"
                >
                  Back
                </button>
                <button
                  onClick={() => userProfile.addictionYears && setOnboardingStep(4)}
                  disabled={!userProfile.addictionYears}
                  className="flex-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white py-3 px-6 rounded-2xl font-bold hover:shadow-2xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  Next <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {onboardingStep === 4 && (
            <div>
              <h2 className="text-3xl font-bold text-white mb-3">Are you religious?</h2>
              <p className="text-indigo-200 mb-6">We can incorporate faith-based support if you'd like.</p>
              
              <div className="space-y-3 mb-6">
                <button
                  onClick={() => {
                    setUserProfile({...userProfile, isReligious: true});
                  }}
                  className={`w-full py-4 rounded-2xl font-bold text-lg transition-all duration-300 ${
                    userProfile.isReligious === true
                      ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white scale-105'
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  Yes, I'm religious
                </button>
                <button
                  onClick={() => {
                    setUserProfile({...userProfile, isReligious: false, religion: ''});
                    setOnboardingStep(5);
                    setSobrietyDate(new Date().toISOString());
                  }}
                  className={`w-full py-4 rounded-2xl font-bold text-lg transition-all duration-300 ${
                    userProfile.isReligious === false
                      ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white scale-105'
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  No, I'm not religious
                </button>
              </div>

              {userProfile.isReligious === true && (
                <div className="animate-fadeIn mb-6">
                  <label className="block text-white font-semibold mb-2">Which faith?</label>
                  <select
                    value={userProfile.religion}
                    onChange={(e) => setUserProfile({...userProfile, religion: e.target.value})}
                    className="w-full px-5 py-4 bg-white/20 border border-white/30 rounded-2xl text-white font-semibold text-lg focus:ring-2 focus:ring-purple-400 transition-all duration-300"
                  >
                    <option value="" className="bg-purple-900">Select your faith</option>
                    <option value="Christian" className="bg-purple-900">Christian</option>
                    <option value="Catholic" className="bg-purple-900">Catholic</option>
                    <option value="Muslim" className="bg-purple-900">Muslim</option>
                    <option value="Jewish" className="bg-purple-900">Jewish</option>
                    <option value="Other" className="bg-purple-900">Other</option>
                  </select>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setOnboardingStep(3)}
                  className="flex-1 bg-white/10 text-white py-3 rounded-2xl font-semibold hover:bg-white/20 transition-all duration-300"
                >
                  Back
                </button>
                {userProfile.isReligious === true && userProfile.religion && (
                  <button
                    onClick={() => {
                      setOnboardingStep(5);
                      setSobrietyDate(new Date().toISOString());
                    }}
                    className="flex-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white py-3 px-6 rounded-2xl font-bold hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    Start Journey <ChevronRight className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideIn {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
        @keyframes celebrate {
          0%, 100% { transform: scale(1) rotate(0deg); }
          25% { transform: scale(1.2) rotate(-10deg); }
          75% { transform: scale(1.2) rotate(10deg); }
        }
        .animate-fadeIn { animation: fadeIn 0.6s ease-out forwards; }
        .animate-slideIn { animation: slideIn 0.4s ease-out forwards; }
        .animate-celebrate { animation: celebrate 0.6s ease-in-out; }
        .glass { background: rgba(255, 255, 255, 0.1); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.2); }
        .glow { box-shadow: 0 0 20px rgba(168, 85, 247, 0.4); }
      `}</style>

      <div className="glass shadow-lg p-5 sticky top-0 z-40">
        <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-pink-300 via-purple-300 to-indigo-300 bg-clip-text text-transparent">
          {userProfile.name}'s Journey
        </h1>
      </div>

      {celebrating && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
          <div className="text-6xl animate-celebrate">🎉</div>
        </div>
      )}

      <div className="p-4 pb-24">
        {activeTab === 'home' && (
          <div className="space-y-5 animate-fadeIn">
            <div className="glass rounded-3xl shadow-2xl p-8 text-center transform hover:scale-105 transition-all duration-300 glow">
              <div className="relative inline-block">
                <Calendar className="w-16 h-16 mx-auto text-purple-300 mb-3 animate-pulse" />
              </div>
              <h2 className="text-7xl font-black bg-gradient-to-r from-pink-300 via-purple-300 to-indigo-300 bg-clip-text text-transparent mb-3 animate-pulse">
                {getDayCount()}
              </h2>
              <p className="text-purple-200 text-2xl font-semibold mb-4">Days Strong</p>
              <div className="mt-5 p-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl border border-purple-400/30">
                <Sparkles className="w-6 h-6 mx-auto text-yellow-300 mb-2" />
                <p className="text-sm text-purple-100 italic font-medium">{currentQuote.text}</p>
                {currentQuote.source && (
                  <p className="text-xs text-purple-300 mt-2 font-semibold">— {currentQuote.source}</p>
                )}
              </div>
            </div>

            <div className="glass rounded-3xl shadow-xl p-6 transform hover:scale-105 transition-all duration-300">
              <h3 className="text-xl font-bold text-white mb-3">Your Journey</h3>
              <div className="space-y-2 text-purple-200">
                <p>💪 Overcoming {userProfile.addictionYears} years of struggle</p>
                <p>🎂 Age: {userProfile.age}</p>
                {userProfile.isReligious && <p>🙏 Faith: {userProfile.religion}</p>}
              </div>
            </div>

            <div className="glass rounded-3xl shadow-xl p-6 transform hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Shield className="w-6 h-6 text-blue-300" />
                  <h3 className="text-2xl font-bold text-white">Website Blocker</h3>
                </div>
                <button
                  onClick={() => setBlockerEnabled(!blockerEnabled)}
                  className={`px-6 py-2 rounded-full font-bold transition-all duration-300 ${
                    blockerEnabled
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white'
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  {blockerEnabled ? 'ON' : 'OFF'}
                </button>
              </div>
              <p className="text-purple-200 text-sm">
                {blockerEnabled 
                  ? '✓ Protection is active. Harmful sites will show a warning.' 
                  : 'Enable to block access to harmful websites'}
              </p>
            </div>

            <div className="glass rounded-3xl shadow-xl p-6 transform hover:scale-105 transition-all duration-300">
              <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <Zap className="w-6 h-6 text-yellow-300" />
                Daily Check-In
              </h3>
              <button
                onClick={dailyCheckIn}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-4 rounded-2xl font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 relative overflow-hidden group"
              >
                <span className="relative z-10">✓ Check In Today</span>
                <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
              <p className="text-sm text-purple-200 mt-3 text-center font-medium">
                🔥 {checkIns.length} total check-ins
              </p>
            </div>

            <div className="bg-gradient-to-br from-red-500/20 to-orange-500/20 border-2 border-red-400/40 rounded-3xl p-6 backdrop-blur-lg transform hover:scale-105 transition-all duration-300">
              <div className="flex items-center mb-4">
                <AlertCircle className="w-7 h-7 text-red-300 mr-2 animate-pulse" />
                <h3 className="text-2xl font-bold text-red-100">I'm Struggling</h3>
              </div>
              <div className="space-y-3">
                <button
                  onClick={() => setShowUrgeLog(true)}
                  className="w-full bg-gradient-to-r from-red-600 to-rose-600 text-white py-4 rounded-2xl font-bold hover:shadow-2xl hover:scale-105 transition-all duration-300"
                >
                  Log This Urge
                </button>
                {accountability.name && (
                  <button className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white py-4 rounded-2xl font-bold hover:shadow-2xl hover:scale-105 transition-all duration-300">
                    Contact {accountability.name}
                  </button>
                )}
                <div className="grid grid-cols-2 gap-3 mt-4">
                  {(userProfile.isReligious 
                    ? [
                        { label: 'Pray', action: 'pray' },
                        { label: 'Read Scripture', action: 'scripture' },
                        { label: 'Exercise', action: 'exercise' },
                        { label: 'Meditate', action: 'meditate' }
                      ]
                    : [
                        { label: 'Take a Walk', action: 'walk' },
                        { label: 'Cold Shower', action: 'shower' },
                        { label: 'Exercise', action: 'exercise' },
                        { label: 'Meditate', action: 'meditate' }
                      ]
                  ).map((item, i) => (
                    <button
                      key={item.action}
                      style={{ animationDelay: `${i * 0.1}s` }}
                      onClick={() => handleGuidanceClick(item.action)}
                      className="glass text-white py-3 rounded-xl text-sm font-bold border border-red-300/30 hover:bg-white/20 hover:scale-110 transition-all duration-300 animate-fadeIn"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="glass rounded-2xl shadow-xl p-6 text-center transform hover:scale-110 hover:rotate-2 transition-all duration-300">
                <TrendingUp className="w-10 h-10 mx-auto text-emerald-300 mb-2 animate-bounce" />
                <p className="text-4xl font-black text-white mb-1">{urges.filter(u => u.overcome).length}</p>
                <p className="text-sm text-purple-200 font-semibold">Urges Overcome</p>
              </div>
              <div className="glass rounded-2xl shadow-xl p-6 text-center transform hover:scale-110 hover:-rotate-2 transition-all duration-300">
                <BookOpen className="w-10 h-10 mx-auto text-blue-300 mb-2 animate-bounce" />
                <p className="text-4xl font-black text-white mb-1">{journalEntries.length}</p>
                <p className="text-sm text-purple-200 font-semibold">Journal Entries</p>
              </div>
            </div>

            <button
              onClick={handleReset}
              className="w-full glass text-white py-3 rounded-2xl text-sm font-semibold hover:bg-white/20 transition-all duration-300"
            >
              Reset Counter
            </button>
          </div>
        )}

        {activeTab === 'urges' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="glass rounded-3xl shadow-xl p-6">
              <h2 className="text-3xl font-bold text-white mb-4">Urge Tracker</h2>
              <p className="text-purple-200 mb-5">Track your urges to identify patterns and celebrate victories.</p>
              <button
                onClick={() => setShowUrgeLog(true)}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-4 rounded-2xl font-bold hover:shadow-2xl hover:scale-105 transition-all duration-300"
              >
                + Log New Urge
              </button>
            </div>

            <div className="space-y-3">
              {urges.map((urge, i) => (
                <div
                  key={urge.id}
                  style={{ animationDelay: `${i * 0.1}s` }}
                  className="glass rounded-2xl shadow-lg p-5 animate-slideIn hover:scale-105 transition-all duration-300"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-sm text-purple-300">
                        {new Date(urge.timestamp).toLocaleDateString()} at{' '}
                        {new Date(urge.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      <p className="text-xl font-bold text-white mt-1">
                        Intensity: {urge.intensity}/10
                      </p>
                    </div>
                    {urge.overcome ? (
                      <span className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                        ✓ Overcome
                      </span>
                    ) : (
                      <button
                        onClick={() => markUrgeOvercome(urge.id)}
                        className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-4 py-2 rounded-full text-sm font-bold hover:shadow-lg hover:scale-110 transition-all duration-300"
                      >
                        Mark Overcome
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {urges.length === 0 && (
                <p className="text-center text-purple-300 py-12 text-lg">No urges logged yet. Stay strong! 💪</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'journal' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="glass rounded-3xl shadow-xl p-6">
              <h2 className="text-3xl font-bold text-white mb-4">Journal</h2>
              <button
                onClick={() => setShowJournal(true)}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-4 rounded-2xl font-bold hover:shadow-2xl hover:scale-105 transition-all duration-300"
              >
                + New Entry
              </button>
            </div>

            <div className="space-y-3">
              {journalEntries.map((entry, i) => (
                <div
                  key={entry.id}
                  style={{ animationDelay: `${i * 0.1}s` }}
                  className="glass rounded-2xl shadow-lg p-5 animate-slideIn hover:scale-105 transition-all duration-300"
                >
                  <p className="text-sm text-purple-300 mb-3">
                    {new Date(entry.timestamp).toLocaleDateString()} at{' '}
                    {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  <p className="text-white leading-relaxed">{entry.text}</p>
                </div>
              ))}
              {journalEntries.length === 0 && (
                <p className="text-center text-purple-300 py-12 text-lg">No journal entries yet. Start writing! ✍️</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'accountability' && (
          <div className="glass rounded-3xl shadow-xl p-6 animate-fadeIn">
            <h2 className="text-3xl font-bold text-white mb-4">Accountability Partner</h2>
            <p className="text-purple-200 mb-6">Add someone you trust to support your journey.</p>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-purple-200 mb-2">Name</label>
                <input
                  type="text"
                  value={accountability.name}
                  onChange={(e) => setAccountability({...accountability, name: e.target.value})}
                  className="w-full px-5 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-purple-300 focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300"
                  placeholder="Enter their name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-purple-200 mb-2">Contact Info</label>
                <input
                  type="text"
                  value={accountability.contact}
                  onChange={(e) => setAccountability({...accountability, contact: e.target.value})}
                  className="w-full px-5 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-purple-300 focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300"
                  placeholder="Phone or email"
                />
              </div>

              {accountability.name && (
                <div className="mt-6 p-5 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-2xl border border-emerald-400/30 animate-fadeIn">
                  <p className="text-emerald-200 font-bold mb-2 text-lg">✓ Partner Added</p>
                  <p className="text-sm text-emerald-100">
                    {accountability.name} is here to support you on your journey.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 glass border-t border-white/20 px-4 py-3 backdrop-blur-xl">
        <div className="flex justify-around max-w-lg mx-auto">
          {[
            { id: 'home', icon: Heart, label: 'Home' },
            { id: 'urges', icon: TrendingUp, label: 'Urges' },
            { id: 'journal', icon: BookOpen, label: 'Journal' },
            { id: 'accountability', icon: Users, label: 'Partner' }
          ].map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex flex-col items-center py-3 px-5 rounded-2xl transition-all duration-300 ${
                activeTab === id 
                  ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white scale-110 shadow-lg' 
                  : 'text-purple-300 hover:bg-white/10'
              }`}
            >
              <Icon className={`w-6 h-6 mb-1 ${activeTab === id ? 'animate-bounce' : ''}`} />
              <span className="text-xs font-bold">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {showUrgeLog && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="glass rounded-3xl p-7 max-w-sm w-full shadow-2xl transform scale-100 animate-fadeIn border border-white/20">
            <h3 className="text-2xl font-bold text-white mb-4">Log Your Urge</h3>
            <p className="text-purple-200 mb-5">Rate the intensity of this urge</p>
            <div className="grid grid-cols-5 gap-3 mb-6">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num, i) => (
                <button
                  key={num}
                  style={{ animationDelay: `${i * 0.05}s` }}
                  onClick={() => handleUrgeLog(num)}
                  className="aspect-square bg-gradient-to-br from-purple-500 to-indigo-500 hover:from-pink-500 hover:to-purple-500 text-white rounded-2xl font-black text-lg transition-all duration-300 hover:scale-125 hover:rotate-12 shadow-lg animate-fadeIn"
                >
                  {num}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowUrgeLog(false)}
              className="w-full glass text-white py-4 rounded-2xl font-bold hover:bg-white/20 transition-all duration-300"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {showJournal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="glass rounded-3xl p-7 max-w-sm w-full shadow-2xl border border-white/20">
            <h3 className="text-2xl font-bold text-white mb-5">New Journal Entry</h3>
            <textarea
              id="journal-text"
              className="w-full px-5 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-purple-300 focus:ring-2 focus:ring-purple-400 focus:border-transparent mb-5 transition-all duration-300"
              rows="6"
              placeholder="Write your thoughts..."
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  const text = document.getElementById('journal-text').value;
                  if (text.trim()) {
                    addJournalEntry(text);
                    setShowJournal(false);
                  }
                }}
                className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-4 rounded-2xl font-bold hover:shadow-2xl hover:scale-105 transition-all duration-300"
              >
                Save
              </button>
              <button
                onClick={() => setShowJournal(false)}
                className="flex-1 glass text-white py-4 rounded-2xl font-bold hover:bg-white/20 transition-all duration-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showGuidance && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn overflow-y-auto">
          <div className="glass rounded-3xl p-7 max-w-lg w-full shadow-2xl border border-white/20 my-8">
            <div className="flex justify-between items-start mb-5">
              <h3 className="text-2xl font-bold text-white">{getGuidanceContent().title}</h3>
              <button
                onClick={() => setShowGuidance(false)}
                className="text-white hover:bg-white/20 p-2 rounded-full transition-all duration-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="bg-white/5 rounded-2xl p-5 mb-5 max-h-96 overflow-y-auto">
              <p className="text-purple-100 whitespace-pre-line leading-relaxed">
                {getGuidanceContent().content}
              </p>
            </div>
            <div className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-2xl p-4 border border-indigo-400/30 mb-5">
              <p className="text-sm font-bold text-indigo-200 mb-2">Action Step:</p>
              <p className="text-sm text-indigo-100">{getGuidanceContent().action}</p>
            </div>
            <button
              onClick={() => setShowGuidance(false)}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-4 rounded-2xl font-bold hover:shadow-2xl hover:scale-105 transition-all duration-300"
            >
              I'm Ready - Let's Do This
            </button>
          </div>
        </div>
      )}
    </div>
  );
}