import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Easing,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

const COLORS = {
  ink: '#23312D',
  muted: '#68746F',
  background: '#F6F3EC',
  card: '#FFFFFF',
  green: '#41695D',
  border: '#EAE6DC',
  urgent: '#A14D47',
};

const TOOLS = {
  stop: {
    title: 'Pause before acting',
    shortTitle: 'STOP',
    subtitle: 'Create a little space between the feeling and what you do next.',
    accent: '#54776D',
    icon: '◇',
    tag: 'START HERE',
    steps: [
      ['Stop', 'Freeze for a moment. Do not act on the first urge.'],
      ['Take a step back', 'Move away if you can. Take one slow breath.'],
      ['Observe', 'Notice your thoughts, feelings, body, and what is happening around you.'],
      ['Proceed mindfully', 'Ask: “What action will help, instead of making this harder?”'],
    ],
    finish: 'You do not have to solve everything right now. Your next wise step can be very small.',
  },
  body: {
    title: 'Turn down the intensity',
    shortTitle: 'Reset my body',
    subtitle: 'Use a body-based TIPP skill when emotion feels physically overwhelming.',
    accent: '#46778A',
    icon: '≈',
    tag: 'TIPP SKILLS',
    choices: [
      {
        title: 'Cool your face',
        text: 'Use a cool cloth or splash cool—not painfully cold—water on your face. Pause if you feel dizzy or unwell.',
      },
      {
        title: 'Move intensely',
        text: 'If it is safe for your body, try brisk walking, stairs, dancing, or jumping jacks for a few minutes.',
      },
      {
        title: 'Pace your breathing',
        text: 'Make your exhale longer than your inhale. The guided breathing tool can lead you through it.',
        action: 'breathing',
      },
      {
        title: 'Release muscle tension',
        text: 'Tense one muscle group as you breathe in. Let it soften completely as you breathe out.',
      },
    ],
    finish: 'Choose one. The goal is to lower the intensity enough to decide what to do next.',
  },
  distract: {
    title: 'Get through ten minutes',
    shortTitle: 'Distract safely',
    subtitle: 'Give the feeling time to come down without doing anything that makes the situation worse.',
    accent: '#7B6C98',
    icon: '✦',
    tag: 'ACCEPTS',
    choices: [
      ['Activity', 'Do one absorbing task: a game, puzzle, shower, tidy-up, or short walk.'],
      ['Contribute', 'Send a kind message, help someone, or do one useful thing.'],
      ['Change the scene', 'Watch something gentle, read, or listen to a familiar podcast.'],
      ['Other thoughts', 'Count colours in the room, name song lyrics, or list cities alphabetically.'],
      ['Strong sensation', 'Hold something cool, smell peppermint, or wrap up in a textured blanket.'],
    ].map(([title, text]) => ({ title, text })),
    finish: 'Set a ten-minute timer. When it ends, check whether the intensity has shifted even one point.',
  },
  soothe: {
    title: 'Comfort myself safely',
    shortTitle: 'Self-soothe',
    subtitle: 'Use your senses to tell your nervous system that this moment is survivable.',
    accent: '#B16F58',
    icon: '○',
    tag: 'FIVE SENSES',
    choices: [
      ['See', 'Lower the lights, look outside, or focus on one calming image.'],
      ['Hear', 'Play a comforting song, nature sounds, or quiet background noise.'],
      ['Smell', 'Use tea, soap, lotion, or another familiar, safe scent.'],
      ['Taste', 'Sip a warm or cold drink slowly and notice it fully.'],
      ['Touch', 'Use a blanket, warm shower, soft clothing, or hold a pet.'],
    ].map(([title, text]) => ({ title, text })),
    finish: 'Pick the easiest sense to reach. Comfort is useful even when it does not fix the problem.',
  },
  accept: {
    title: 'Let this moment be here',
    shortTitle: 'Accept this moment',
    subtitle: 'Stop fighting reality for a moment so you can save energy for what is actually possible.',
    accent: '#6B7951',
    icon: '⌁',
    tag: 'RADICAL ACCEPTANCE',
    steps: [
      ['Name reality', 'Say only the facts of what is happening, without “should” or “shouldn’t.”'],
      ['Notice the fight', 'Observe thoughts like “this cannot be happening” without arguing with them.'],
      ['Turn toward now', 'Try: “I do not approve of this, and it is what is happening right now.”'],
      ['Choose again', 'Acceptance may last only a moment. You can return to it as often as needed.'],
    ],
    finish: 'Acceptance is not approval, giving up, or saying the situation is fair.',
  },
};

const SKILLS = {
  ...TOOLS,
  wiseMind: {
    title: 'Find Wise Mind', shortTitle: 'Wise Mind', subtitle: 'Bring emotion and reason together before choosing what to do.', accent: '#55758A', icon: '◉', tag: 'MINDFULNESS',
    steps: [['Notice Emotion Mind', 'What are you feeling and what does the emotion urge you to do?'], ['Notice Reasonable Mind', 'What are the facts? What would pure logic say?'], ['Make room for both', 'Neither side has to disappear. Let both pieces of information be present.'], ['Listen for Wise Mind', 'Ask quietly: “Knowing my feelings and the facts, what do I know is effective?”']],
    finish: 'Wise Mind may feel calm and clear—or simply like the next action you will not regret.',
  },
  whatSkills: {
    title: 'Come back to now', shortTitle: 'What skills', subtitle: 'Use Observe, Describe, and Participate to return attention to this moment.', accent: '#55758A', icon: '◎', tag: 'MINDFULNESS · WHAT',
    steps: [['Observe', 'Notice sensations, thoughts, and feelings. Let them arrive and leave without pushing them away.'], ['Describe', 'Put simple words on what you notice: “My chest is tight” or “I am having the thought that…”'], ['Participate', 'Enter fully into the activity you are doing instead of watching yourself do it.']],
    finish: 'You do not need to use all three perfectly. Practising any one of them is mindfulness.',
  },
  howSkills: {
    title: 'Choose how to practise', shortTitle: 'How skills', subtitle: 'Practise without judgment, one thing at a time, and with effectiveness in mind.', accent: '#55758A', icon: '⌁', tag: 'MINDFULNESS · HOW',
    steps: [['Non-judgmentally', 'State what happened without adding “good,” “bad,” “should,” or blame.'], ['One-mindfully', 'Do one thing at a time. When attention wanders, gently return.'], ['Effectively', 'Focus on what works in this situation—not on proving a point or being right.']],
    finish: 'Notice judgments without judging yourself for having them, then return to the facts.',
  },
  grounding: {
    title: 'Ground through your senses', shortTitle: '5–4–3–2–1', subtitle: 'Orient to the room when thoughts feel fast, unreal, or far away.', accent: '#55758A', icon: '✦', tag: 'MINDFULNESS',
    steps: [['5 things you see', 'Name shapes, colours, light, or objects around you.'], ['4 things you feel', 'Notice your feet, clothing, chair, temperature, or another safe sensation.'], ['3 things you hear', 'Listen for sounds nearby and farther away.'], ['2 things you smell', 'Notice two scents, or remember two familiar ones.'], ['1 thing you taste', 'Notice your current taste or take one mindful sip.']],
    finish: 'There is no need to feel calm immediately. The goal is to reconnect with this place and moment.',
  },
  nameEmotion: {
    title: 'Understand the emotion', shortTitle: 'Name the emotion', subtitle: 'Slow the reaction down by identifying what is happening.', accent: '#A56759', icon: '◌', tag: 'EMOTION REGULATION',
    steps: [['Prompting event', 'What happened just before the emotion began? Stick to observable facts.'], ['Interpretation', 'What meaning or assumption did your mind add?'], ['Body and expression', 'Where do you feel it? What is your face, posture, or voice doing?'], ['Action urge', 'What does the emotion make you want to do?'], ['Name it', 'Choose the closest emotion word and rate its intensity from 0–10.']],
    finish: 'An emotion is information—not an instruction. You can notice the urge without acting on it.',
  },
  checkFacts: {
    title: 'Check the Facts', shortTitle: 'Check the Facts', subtitle: 'Find out whether the emotion and its intensity fit what is actually happening.', accent: '#A56759', icon: '?', tag: 'EMOTION REGULATION',
    steps: [['Name the emotion', 'What emotion do you want to examine?'], ['Describe the event', 'What could a camera record? Leave out assumptions and judgments.'], ['Check interpretations', 'What are other possible explanations? Are you treating a fear as a certainty?'], ['Check the threat', 'What outcome are you predicting, and how likely is it?'], ['Re-rate', 'Does the emotion—or its intensity—fit the facts now?']],
    finish: 'If the emotion fits the facts, problem solving may help. If it does not, consider Opposite Action.',
  },
  oppositeAction: {
    title: 'Choose Opposite Action', shortTitle: 'Opposite Action', subtitle: 'Act opposite to an unhelpful emotion urge when the emotion does not fit the facts.', accent: '#A56759', icon: '↔', tag: 'EMOTION REGULATION',
    steps: [['Check first', 'Make sure the emotion or its intensity does not fit the facts, or acting on it would be ineffective.'], ['Name the urge', 'What exactly do you want to do—avoid, attack, hide, shut down, or cling?'], ['Find the opposite', 'Choose an action, posture, words, and tone that move the other way.'], ['Do it fully', 'Commit gently but completely; half-opposite action usually keeps the emotion going.'], ['Repeat', 'Continue until the emotion or urge begins to shift.']],
    finish: 'Do not use Opposite Action to ignore genuine danger. Safety and facts come first.',
  },
  problemSolve: {
    title: 'Problem Solve', shortTitle: 'Problem Solving', subtitle: 'Use when the emotion fits the facts and the situation can be changed.', accent: '#A56759', icon: '◇', tag: 'EMOTION REGULATION',
    steps: [['Define one problem', 'Describe it specifically and without judgment.'], ['Check your goal', 'What realistic outcome would improve the situation?'], ['Brainstorm', 'List several options before evaluating them.'], ['Choose', 'Pick the option most likely to help with acceptable costs.'], ['Make the first step tiny', 'Decide exactly what, when, and where you will begin.'], ['Review', 'Try it, observe the result, and adjust if needed.']],
    finish: 'If the problem cannot be changed right now, return to acceptance or distress-tolerance skills.',
  },
  please: {
    title: 'Lower emotional vulnerability', shortTitle: 'PLEASE', subtitle: 'Support the physical basics that make emotion regulation easier.', accent: '#A56759', icon: '+', tag: 'EMOTION REGULATION · PLEASE',
    steps: [['Treat physical illness', 'Follow appropriate medical care and attend to symptoms rather than ignoring them.'], ['Balance eating', 'Eat regularly and in a way that supports your body.'], ['Avoid mood-altering substances', 'Notice substances that increase vulnerability or impulsivity.'], ['Balance sleep', 'Aim for a consistent amount and schedule that works for you.'], ['Get exercise', 'Choose regular movement appropriate for your health and ability.']],
    finish: 'This is maintenance, not a demand for perfection. One supportive choice still counts.',
  },
  priorities: {
    title: 'Clarify your priority', shortTitle: 'What matters most?', subtitle: 'Before a conversation, decide what you most need to protect.', accent: '#826B94', icon: '△', tag: 'INTERPERSONAL EFFECTIVENESS',
    steps: [['Objective', 'Is getting a result—asking, saying no, or solving something—the main goal?'], ['Relationship', 'Is preserving trust or connection most important here?'], ['Self-respect', 'Is acting according to your values and respecting yourself the priority?'], ['Balance', 'Rank the three. Your top priority helps you choose the next skill.']],
    finish: 'Use DEAR MAN for your objective, GIVE for the relationship, and FAST for self-respect.',
  },
  dearMan: {
    title: 'Ask or say no clearly', shortTitle: 'DEAR MAN', subtitle: 'Prepare a focused request, boundary, or refusal.', accent: '#826B94', icon: '→', tag: 'INTERPERSONAL · OBJECTIVE',
    steps: [['Describe', 'Briefly state the facts of the situation.'], ['Express', 'Use “I” statements to say how it affects you.'], ['Assert', 'Clearly ask for what you want—or say no.'], ['Reinforce', 'Explain the positive result of working with you.'], ['Mindful', 'Stay on topic; repeat your point without chasing distractions.'], ['Appear confident', 'Use a steady voice, posture, and eye contact that fit the situation.'], ['Negotiate', 'Offer alternatives and ask what the other person suggests.']],
    finish: 'Clear and respectful is enough. You cannot control the answer, only how effectively you ask.',
  },
  give: {
    title: 'Protect the relationship', shortTitle: 'GIVE', subtitle: 'Stay connected and respectful during a difficult interaction.', accent: '#826B94', icon: '♡', tag: 'INTERPERSONAL · RELATIONSHIP',
    steps: [['Gentle', 'Avoid attacks, threats, contempt, and judging language.'], ['Interested', 'Listen without interrupting; show attention in a culturally comfortable way.'], ['Validate', 'Acknowledge what makes sense about the other person’s feelings or viewpoint.'], ['Easy manner', 'Use warmth or appropriate lightness rather than escalating intensity.']],
    finish: 'Validation means communicating understanding. It does not require agreement or surrendering a boundary.',
  },
  fast: {
    title: 'Keep your self-respect', shortTitle: 'FAST', subtitle: 'Act in a way that remains consistent with your values.', accent: '#826B94', icon: '□', tag: 'INTERPERSONAL · SELF-RESPECT',
    steps: [['Fair', 'Be fair to yourself and to the other person.'], ['No unnecessary apologies', 'Apologize for harm—not for existing, having needs, or making a reasonable request.'], ['Stick to values', 'Do not abandon what matters to you just to gain approval.'], ['Truthful', 'Do not exaggerate, invent excuses, or act helpless when you are not.']],
    finish: 'Effectiveness includes being able to respect yourself after the conversation is over.',
  },
  improve: {
    title: 'Improve this moment', shortTitle: 'IMPROVE', subtitle: 'Make a painful moment a little more bearable without needing to fix everything.', accent: '#54776D', icon: '↟', tag: 'DISTRESS TOLERANCE',
    choices: [['Imagery', 'Picture a safe or peaceful place in sensory detail.'], ['Meaning', 'Connect this moment to a value, purpose, or reason to keep going.'], ['Prayer or reflection', 'Connect with your spiritual practice, values, or a larger perspective.'], ['Relaxation', 'Soften your face, lower your shoulders, or use paced breathing.'], ['One thing now', 'Bring attention back to only the task or minute in front of you.'], ['Vacation', 'Take a brief, safe mental or physical break.'], ['Encouragement', 'Speak to yourself as you would to someone you deeply care about.']].map(([title, text]) => ({ title, text })),
    finish: 'The aim is not to pretend things are fine. It is to reduce suffering enough to get through this moment.',
  },
  prosCons: {
    title: 'Remember the consequences', shortTitle: 'Pros and Cons', subtitle: 'Use before acting on a crisis urge, while you still have a little space to choose.', accent: '#54776D', icon: '±', tag: 'DISTRESS TOLERANCE',
    steps: [['Name the urge', 'Write the exact behaviour you are considering.'], ['Pros of acting', 'What immediate relief or result might it bring?'], ['Cons of acting', 'What could it cost later—safety, trust, health, goals, or self-respect?'], ['Pros of resisting', 'What becomes possible if you use a skill instead?'], ['Cons of resisting', 'Acknowledge honestly what will be difficult about not acting.'], ['Look beyond tonight', 'Read all four lists and picture the consequences tomorrow and later.']],
    finish: 'Prepare this list before a crisis if possible and keep it somewhere easy to reach.',
  },
};

const MODULES = [
  { id: 'mindfulness', title: 'Mindfulness', prompt: 'I’m lost in thoughts or disconnected', description: 'Be present and access Wise Mind.', accent: '#55758A', icon: '◎', skills: ['wiseMind', 'whatSkills', 'howSkills', 'grounding'] },
  { id: 'distress', title: 'Distress Tolerance', prompt: 'I need to survive this moment', description: 'Get through a crisis without making it worse.', accent: '#54776D', icon: '◇', skills: ['stop', 'body', 'distract', 'soothe', 'improve', 'prosCons', 'accept'] },
  { id: 'emotion', title: 'Emotion Regulation', prompt: 'An emotion is running the show', description: 'Understand emotions and choose effective action.', accent: '#A56759', icon: '◌', skills: ['nameEmotion', 'checkFacts', 'oppositeAction', 'problemSolve', 'please'] },
  { id: 'interpersonal', title: 'Interpersonal Effectiveness', prompt: 'I need help with another person', description: 'Ask, say no, connect, and keep self-respect.', accent: '#826B94', icon: '↔', skills: ['priorities', 'dearMan', 'give', 'fast'] },
];

const EXERCISES = [
  {
    id: 'paced', title: 'Paced breathing', subtitle: 'Longer exhale for high distress', duration: '3 minutes', sessionSeconds: 180,
    accent: '#46778A', icon: '≈',
    pattern: [{ label: 'Breathe in', seconds: 4, scale: 1.45 }, { label: 'Breathe out', seconds: 6, scale: 0.78 }],
    intro: 'A longer exhale can help your body move toward a calmer state.',
  },
  {
    id: 'box', title: 'Box breathing', subtitle: 'Find focus and steadiness', duration: '4 minutes', sessionSeconds: 240,
    accent: '#54776D', icon: '□',
    pattern: [{ label: 'Breathe in', seconds: 4, scale: 1.45 }, { label: 'Hold', seconds: 4, scale: 1.45 }, { label: 'Breathe out', seconds: 4, scale: 0.78 }, { label: 'Hold', seconds: 4, scale: 0.78 }],
    intro: 'A steady four-part rhythm for settling and focusing your attention.',
  },
  {
    id: 'coherent', title: 'Even breathing', subtitle: 'Restore a gentle rhythm', duration: '5 minutes', sessionSeconds: 300,
    accent: '#B16F58', icon: '○',
    pattern: [{ label: 'Breathe in', seconds: 5, scale: 1.45 }, { label: 'Breathe out', seconds: 5, scale: 0.78 }],
    intro: 'An even, unforced breath to help bring your attention back to the present.',
  },
];

function BackButton({ onPress, label = 'Back' }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} hitSlop={12} style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}>
      <Text style={styles.backArrow}>‹</Text><Text style={styles.backText}>{label}</Text>
    </Pressable>
  );
}

function HomeScreen({ navigate }) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.homeContent} showsVerticalScrollIndicator={false}>
        <View style={styles.brandRow}><View style={styles.brandMark}><Text style={styles.brandMarkText}>P</Text></View><Text style={styles.brandName}>Pocket DBT</Text></View>
        <View style={styles.hero}>
          <Text style={styles.title}>Your DBT cheat sheet</Text>
          <Text style={styles.description}>You don’t have to remember all the tools. Choose a module, or let the app help you find the skill that fits.</Text>
        </View>

        <Pressable onPress={() => navigate({ type: 'chooser' })} style={({ pressed }) => [styles.primaryCard, pressed && styles.cardPressed]}>
          <View style={styles.primaryIcon}><Text style={styles.primaryIconText}>?</Text></View>
          <View style={styles.cardCopy}><Text style={styles.primaryLabel}>NOT SURE WHICH SKILL?</Text><Text style={styles.primaryTitle}>Help me choose</Text><Text style={styles.primaryText}>Start with what is happening right now.</Text></View>
          <Text style={styles.chevronLight}>›</Text>
        </Pressable>

        <Text style={styles.homeSection}>THE FOUR DBT MODULES</Text>
        <View style={styles.toolGrid}>
          {MODULES.map((module) => {
            return (
              <Pressable key={module.id} onPress={() => navigate({ type: 'module', id: module.id })} style={({ pressed }) => [styles.toolCard, pressed && styles.cardPressed]}>
                <View style={[styles.toolIcon, { backgroundColor: `${module.accent}18` }]}><Text style={[styles.toolIconText, { color: module.accent }]}>{module.icon}</Text></View>
                <Text style={styles.toolPrompt}>{module.title}</Text><Text style={styles.toolName}>{module.description}</Text>
              </Pressable>
            );
          })}
        </View>

        <Pressable onPress={() => navigate({ type: 'breathingList' })} style={({ pressed }) => [styles.wideCard, pressed && styles.cardPressed]}>
          <View style={[styles.wideIcon, { backgroundColor: '#46778A18' }]}><Text style={[styles.toolIconText, { color: '#46778A' }]}>≈</Text></View>
          <View style={styles.cardCopy}><Text style={styles.wideTitle}>Guided breathing</Text><Text style={styles.wideText}>Follow a visual timer, one breath at a time.</Text></View><Text style={styles.chevron}>›</Text>
        </Pressable>

        <Pressable onPress={() => navigate({ type: 'support' })} style={({ pressed }) => [styles.supportLink, pressed && styles.pressed]}>
          <Text style={styles.supportLinkText}>I need urgent support</Text><Text style={styles.chevron}>›</Text>
        </Pressable>
        <Text style={styles.disclaimer}>A DBT-informed reminder tool—not a replacement for therapy, medical care, or a personal safety plan.</Text>
        <Pressable accessibilityRole="button" onPress={() => navigate({ type: 'info' })} style={({ pressed }) => [styles.infoLink, pressed && styles.pressed]}><Text style={styles.infoLinkText}>About & Privacy</Text></Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function ToolScreen({ tool, navigate, goHome, backLabel = 'Home' }) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.screenContent} showsVerticalScrollIndicator={false}>
        <BackButton onPress={goHome} label={backLabel} />
        <View style={[styles.pageIcon, { backgroundColor: `${tool.accent}18` }]}><Text style={[styles.pageIconText, { color: tool.accent }]}>{tool.icon}</Text></View>
        <Text style={[styles.toolTag, { color: tool.accent }]}>{tool.tag}</Text>
        <Text style={styles.pageTitle}>{tool.title}</Text><Text style={styles.pageIntro}>{tool.subtitle}</Text>

        {tool.steps ? (
          <View style={styles.stepsCard}>
            {tool.steps.map(([label, text], index) => (
              <View key={label} style={[styles.stepRow, index < tool.steps.length - 1 && styles.divider]}>
                <View style={[styles.stepNumber, { backgroundColor: tool.accent }]}><Text style={styles.stepNumberText}>{index + 1}</Text></View>
                <View style={styles.cardCopy}><Text style={styles.stepLabel}>{label}</Text><Text style={styles.stepText}>{text}</Text></View>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.choiceList}>
            {tool.choices.map((choice, index) => (
              <Pressable key={choice.title} disabled={!choice.action} onPress={() => choice.action && navigate({ type: 'breathingList' })} style={({ pressed }) => [styles.choiceCard, choice.action && styles.actionChoice, pressed && styles.cardPressed]}>
                <View style={[styles.choiceDot, { backgroundColor: tool.accent }]}><Text style={styles.choiceDotText}>{index + 1}</Text></View>
                <View style={styles.cardCopy}><Text style={styles.choiceTitle}>{choice.title}</Text><Text style={styles.choiceText}>{choice.text}</Text>{choice.action && <Text style={[styles.inlineAction, { color: tool.accent }]}>Open guided breathing →</Text>}</View>
              </Pressable>
            ))}
          </View>
        )}
        <View style={[styles.reminderCard, { backgroundColor: `${tool.accent}12` }]}><Text style={[styles.reminderLabel, { color: tool.accent }]}>REMEMBER</Text><Text style={styles.reminderText}>{tool.finish}</Text></View>
        <Pressable onPress={() => navigate({ type: 'support' })} style={styles.smallSupport}><Text style={styles.smallSupportText}>Need urgent support?</Text></Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function ModuleScreen({ module, navigate, goHome }) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.screenContent} showsVerticalScrollIndicator={false}>
        <BackButton onPress={goHome} label="Modules" />
        <View style={[styles.pageIcon, { backgroundColor: `${module.accent}18` }]}><Text style={[styles.pageIconText, { color: module.accent }]}>{module.icon}</Text></View>
        <Text style={[styles.toolTag, { color: module.accent }]}>DBT MODULE</Text>
        <Text style={styles.pageTitle}>{module.title}</Text><Text style={styles.pageIntro}>{module.description}</Text>
        <View style={styles.moduleSkillList}>
          {module.skills.map((skillId, index) => {
            const skill = SKILLS[skillId];
            return (
              <Pressable key={skillId} onPress={() => navigate({ type: 'tool', id: skillId, moduleId: module.id })} style={({ pressed }) => [styles.moduleSkillCard, pressed && styles.cardPressed]}>
                <View style={[styles.moduleSkillNumber, { backgroundColor: `${module.accent}18` }]}><Text style={[styles.moduleSkillNumberText, { color: module.accent }]}>{index + 1}</Text></View>
                <View style={styles.cardCopy}><Text style={styles.moduleSkillTitle}>{skill.shortTitle}</Text><Text numberOfLines={2} style={styles.moduleSkillText}>{skill.subtitle}</Text></View><Text style={styles.chevron}>›</Text>
              </Pressable>
            );
          })}
        </View>
        {module.id === 'distress' && <Pressable onPress={() => navigate({ type: 'breathingList' })} style={({ pressed }) => [styles.wideCard, pressed && styles.cardPressed]}><View style={[styles.wideIcon, { backgroundColor: '#46778A18' }]}><Text style={[styles.toolIconText, { color: '#46778A' }]}>≈</Text></View><View style={styles.cardCopy}><Text style={styles.wideTitle}>Guided breathing</Text><Text style={styles.wideText}>Use a visual breathing timer.</Text></View><Text style={styles.chevron}>›</Text></Pressable>}
      </ScrollView>
    </SafeAreaView>
  );
}

function ChooserScreen({ navigate, goHome }) {
  const options = [
    { title: 'I might act on an urge', text: 'Pause before doing anything else.', icon: 'Ⅱ', color: '#54776D', route: { type: 'tool', id: 'stop', moduleId: 'distress' } },
    { title: 'I’m overwhelmed or in crisis', text: 'Survive the moment without making it worse.', icon: '◇', color: '#54776D', route: { type: 'module', id: 'distress' } },
    { title: 'I’m stuck in thoughts', text: 'Return attention to the present.', icon: '◎', color: '#55758A', route: { type: 'module', id: 'mindfulness' } },
    { title: 'An emotion is taking over', text: 'Understand it and choose what to do.', icon: '◌', color: '#A56759', route: { type: 'module', id: 'emotion' } },
    { title: 'This is about another person', text: 'Ask, say no, validate, or protect self-respect.', icon: '↔', color: '#826B94', route: { type: 'module', id: 'interpersonal' } },
  ];
  return (
    <SafeAreaView style={styles.safeArea}><ScrollView contentContainerStyle={styles.screenContent} showsVerticalScrollIndicator={false}>
      <BackButton onPress={goHome} label="Home" /><Text style={styles.toolTag}>HELP ME CHOOSE</Text><Text style={styles.pageTitle}>What is happening right now?</Text><Text style={styles.pageIntro}>Choose the closest answer. It does not need to fit perfectly.</Text>
      <View style={styles.choiceList}>{options.map((option) => (
        <Pressable key={option.title} onPress={() => navigate(option.route)} style={({ pressed }) => [styles.chooserCard, pressed && styles.cardPressed]}>
          <View style={[styles.chooserIcon, { backgroundColor: `${option.color}18` }]}><Text style={[styles.chooserIconText, { color: option.color }]}>{option.icon}</Text></View>
          <View style={styles.cardCopy}><Text style={styles.chooserTitle}>{option.title}</Text><Text style={styles.chooserText}>{option.text}</Text></View><Text style={styles.chevron}>›</Text>
        </Pressable>
      ))}</View>
      <Pressable onPress={() => navigate({ type: 'support' })} style={styles.smallSupport}><Text style={styles.smallSupportText}>I cannot stay safe</Text></Pressable>
    </ScrollView></SafeAreaView>
  );
}

function BreathingList({ navigate, goHome }) {
  return (
    <SafeAreaView style={styles.safeArea}><ScrollView contentContainerStyle={styles.screenContent}>
      <BackButton onPress={goHome} label="Home" /><Text style={styles.toolTag}>GUIDED PRACTICE</Text><Text style={styles.pageTitle}>Breathe with the circle</Text><Text style={styles.pageIntro}>Keep the breath gentle. Stop if you feel dizzy, faint, or uncomfortable.</Text>
      <View style={styles.choiceList}>{EXERCISES.map((exercise) => (
        <Pressable key={exercise.id} onPress={() => navigate({ type: 'breathing', exercise })} style={({ pressed }) => [styles.exerciseCard, pressed && styles.cardPressed]}>
          <View style={[styles.wideIcon, { backgroundColor: `${exercise.accent}18` }]}><Text style={[styles.toolIconText, { color: exercise.accent }]}>{exercise.icon}</Text></View>
          <View style={styles.cardCopy}><Text style={styles.wideTitle}>{exercise.title}</Text><Text style={styles.wideText}>{exercise.subtitle}</Text><Text style={styles.duration}>{exercise.duration}</Text></View><Text style={styles.chevron}>›</Text>
        </Pressable>
      ))}</View>
    </ScrollView></SafeAreaView>
  );
}

function formatTime(seconds) {
  return `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`;
}

function BreathingScreen({ exercise, goBack }) {
  const [running, setRunning] = useState(false);
  const [remaining, setRemaining] = useState(exercise.sessionSeconds);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [phaseRemaining, setPhaseRemaining] = useState(exercise.pattern[0].seconds);
  const scale = useRef(new Animated.Value(0.78)).current;
  const phase = exercise.pattern[phaseIndex];
  const complete = remaining === 0;

  useEffect(() => {
    if (!running) { scale.stopAnimation(); return undefined; }
    Animated.timing(scale, { toValue: phase.scale, duration: phase.seconds * 1000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }).start();
    return () => scale.stopAnimation();
  }, [phase.scale, phase.seconds, phaseIndex, running, scale]);

  useEffect(() => {
    if (!running) return undefined;
    const timer = setInterval(() => {
      setRemaining((value) => { if (value <= 1) { setRunning(false); return 0; } return value - 1; });
      setPhaseRemaining((value) => {
        if (value > 1) return value - 1;
        const next = (phaseIndex + 1) % exercise.pattern.length;
        setPhaseIndex(next); return exercise.pattern[next].seconds;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [exercise.pattern, phaseIndex, running]);

  const reset = () => { setRunning(false); setRemaining(exercise.sessionSeconds); setPhaseIndex(0); setPhaseRemaining(exercise.pattern[0].seconds); scale.setValue(0.78); };
  const toggle = () => { if (complete) { reset(); setTimeout(() => setRunning(true), 0); } else setRunning((value) => !value); };

  return (
    <SafeAreaView style={styles.safeArea}><ScrollView contentContainerStyle={styles.screenContent}>
      <BackButton onPress={goBack} label="Breathing" /><Text style={styles.toolTag}>GUIDED PRACTICE</Text><Text style={styles.pageTitle}>{exercise.title}</Text><Text style={styles.pageIntro}>{exercise.intro}</Text>
      <View style={styles.guideCard}>
        <Text style={styles.timerText}>{formatTime(remaining)}</Text><Text style={styles.timerLabel}>REMAINING</Text>
        <View style={styles.breathingStage}><View style={[styles.breathingHalo, { backgroundColor: `${exercise.accent}12` }]} /><Animated.View style={[styles.breathingCircle, { backgroundColor: exercise.accent, transform: [{ scale }] }]}><Text style={styles.breathingCue}>{complete ? 'Complete' : running ? phase.label : remaining < exercise.sessionSeconds ? 'Paused' : 'Ready'}</Text>{running && <Text style={styles.phaseTime}>{phaseRemaining}</Text>}</Animated.View></View>
        <Pressable onPress={toggle} style={({ pressed }) => [styles.startButton, { backgroundColor: exercise.accent }, pressed && styles.cardPressed]}><Text style={styles.startButtonText}>{complete ? 'Start again' : running ? 'Pause' : remaining < exercise.sessionSeconds ? 'Continue' : 'Start'}</Text></Pressable>
        {remaining < exercise.sessionSeconds && !complete && <Pressable onPress={reset} style={styles.resetButton}><Text style={styles.resetText}>Reset</Text></Pressable>}
      </View>
    </ScrollView></SafeAreaView>
  );
}

function SupportScreen({ goHome }) {
  const open = (url, fallback) => Linking.openURL(url).catch(() => Alert.alert('Could not open this action', fallback));
  return (
    <SafeAreaView style={styles.safeArea}><ScrollView contentContainerStyle={styles.screenContent}>
      <BackButton onPress={goHome} label="Home" /><View style={styles.supportIcon}><Text style={styles.supportIconText}>♡</Text></View><Text style={styles.supportTitle}>You deserve human support</Text><Text style={styles.pageIntro}>This app cannot provide crisis care. If you might hurt yourself or someone else, or cannot stay safe, reach out now.</Text>
      <View style={styles.supportCard}><Text style={styles.supportCardLabel}>CANADA · 24/7</Text><Text style={styles.supportCardTitle}>Call or text 9-8-8</Text><Text style={styles.supportCardText}>Connect with a trained suicide crisis responder in English or French.</Text>
        <Pressable onPress={() => open('tel:988', 'Call 9-8-8 from your phone.')} style={styles.callButton}><Text style={styles.callButtonText}>Call 9-8-8</Text></Pressable>
        <Pressable onPress={() => open('sms:988', 'Text 9-8-8 from your phone.')} style={styles.textButton}><Text style={styles.textButtonText}>Text 9-8-8</Text></Pressable>
      </View>
      <View style={styles.dangerCard}><Text style={styles.dangerTitle}>Immediate danger or urgent medical need?</Text><Text style={styles.dangerText}>Call emergency services now or go to the nearest emergency department.</Text><Pressable onPress={() => open('tel:911', 'Call 9-1-1 from your phone.')}><Text style={styles.dangerAction}>Call 9-1-1</Text></Pressable></View>
      <Text style={styles.locationNote}>These numbers are for Canada. If you are elsewhere, use your local emergency and crisis services.</Text>
    </ScrollView></SafeAreaView>
  );
}

function InfoScreen({ goHome }) {
  return (
    <SafeAreaView style={styles.safeArea}><ScrollView contentContainerStyle={styles.screenContent}>
      <BackButton onPress={goHome} label="Home" />
      <Text style={styles.toolTag}>ABOUT THE APP</Text><Text style={styles.pageTitle}>Pocket DBT</Text>
      <Text style={styles.pageIntro}>A private, offline cheat sheet for remembering and practising commonly taught DBT skills.</Text>
      <View style={styles.infoCard}><Text style={styles.infoTitle}>Important limits</Text><Text style={styles.infoText}>Pocket DBT is an educational reference and practice aid. It does not provide therapy, diagnosis, medical advice, treatment, or crisis care. It is not a substitute for professional support or a personal safety plan.</Text></View>
      <View style={styles.infoCard}><Text style={styles.infoTitle}>Privacy</Text><Text style={styles.infoText}>Pocket DBT does not require an account and does not collect, store, sell, or share personal information or health information. It contains no advertising, analytics, or tracking. Your use of skills and breathing exercises is not recorded.</Text><Text style={styles.infoText}>If you tap a call or text button, the app asks iOS to open Phone or Messages. Pocket DBT does not place the call, send the message, or receive information about it.</Text></View>
      <View style={styles.infoCard}><Text style={styles.infoTitle}>Content</Text><Text style={styles.infoText}>The app is DBT-informed but is not affiliated with or endorsed by Behavioral Tech, the Linehan Institute, or any healthcare provider. Skills may be taught differently by different clinicians; follow the guidance of your own care team.</Text></View>
      <Text style={styles.versionText}>Pocket DBT · Version 1.0.0</Text>
    </ScrollView></SafeAreaView>
  );
}

export default function App() {
  const [route, setRoute] = useState({ type: 'home' });
  const home = () => setRoute({ type: 'home' });
  let screen;
  if (route.type === 'tool') screen = <ToolScreen tool={SKILLS[route.id]} navigate={setRoute} goHome={route.moduleId ? () => setRoute({ type: 'module', id: route.moduleId }) : home} backLabel={route.moduleId ? 'Skills' : 'Home'} />;
  else if (route.type === 'module') screen = <ModuleScreen module={MODULES.find((module) => module.id === route.id)} navigate={setRoute} goHome={home} />;
  else if (route.type === 'chooser') screen = <ChooserScreen navigate={setRoute} goHome={home} />;
  else if (route.type === 'breathingList') screen = <BreathingList navigate={setRoute} goHome={home} />;
  else if (route.type === 'breathing') screen = <BreathingScreen exercise={route.exercise} goBack={() => setRoute({ type: 'breathingList' })} />;
  else if (route.type === 'support') screen = <SupportScreen goHome={home} />;
  else if (route.type === 'info') screen = <InfoScreen goHome={home} />;
  else screen = <HomeScreen navigate={setRoute} />;
  return <SafeAreaProvider><View style={styles.app}><StatusBar style="dark" />{screen}</View></SafeAreaProvider>;
}

const styles = StyleSheet.create({
  app: { flex: 1, backgroundColor: COLORS.background }, safeArea: { flex: 1, backgroundColor: COLORS.background }, pressed: { opacity: 0.55 }, cardPressed: { opacity: 0.84, transform: [{ scale: 0.985 }] },
  homeContent: { paddingHorizontal: 20, paddingTop: Platform.OS === 'android' ? 28 : 12, paddingBottom: 38 }, screenContent: { paddingHorizontal: 22, paddingTop: Platform.OS === 'android' ? 25 : 8, paddingBottom: 44 },
  brandRow: { flexDirection: 'row', alignItems: 'center' }, brandMark: { width: 35, height: 35, borderRadius: 18, backgroundColor: COLORS.green, alignItems: 'center', justifyContent: 'center', marginRight: 10 }, brandMarkText: { color: '#FFF', fontWeight: '800', fontSize: 17 }, brandName: { color: COLORS.green, fontSize: 18, fontWeight: '800' },
  hero: { paddingTop: 43, paddingBottom: 26 }, eyebrow: { color: '#71827C', fontSize: 11, fontWeight: '800', letterSpacing: 1.8, marginBottom: 11 }, title: { color: COLORS.ink, fontSize: 36, lineHeight: 42, fontWeight: '750', letterSpacing: -1.1 }, description: { color: COLORS.muted, fontSize: 16, lineHeight: 24, marginTop: 14 },
  primaryCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.green, borderRadius: 24, padding: 18, minHeight: 122 }, primaryIcon: { width: 54, height: 54, borderRadius: 17, backgroundColor: '#FFFFFF18', alignItems: 'center', justifyContent: 'center', marginRight: 15 }, primaryIconText: { color: '#FFF', fontSize: 25, fontWeight: '700' }, primaryLabel: { color: '#D8E4DF', fontSize: 10, fontWeight: '800', letterSpacing: 1.2, marginBottom: 5 }, primaryTitle: { color: '#FFF', fontSize: 20, fontWeight: '800', marginBottom: 4 }, primaryText: { color: '#E1EAE6', fontSize: 13, lineHeight: 18 }, chevronLight: { color: '#FFF', fontSize: 30, marginLeft: 8 }, cardCopy: { flex: 1 },
  homeSection: { color: '#7D8783', fontSize: 11, fontWeight: '800', letterSpacing: 1.4, marginTop: 30, marginBottom: 12 }, toolGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 }, toolCard: { width: '48%', flexGrow: 1, minHeight: 154, backgroundColor: COLORS.card, borderRadius: 21, borderWidth: 1, borderColor: COLORS.border, padding: 15 }, toolIcon: { width: 43, height: 43, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 16 }, toolIconText: { fontSize: 23, fontWeight: '700' }, toolPrompt: { color: COLORS.ink, fontSize: 15, lineHeight: 20, fontWeight: '700' }, toolName: { color: '#89918E', fontSize: 11, fontWeight: '700', marginTop: 6 },
  wideCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card, borderRadius: 21, borderWidth: 1, borderColor: COLORS.border, padding: 15, marginTop: 12, minHeight: 90 }, wideIcon: { width: 52, height: 52, borderRadius: 17, alignItems: 'center', justifyContent: 'center', marginRight: 14 }, wideTitle: { color: COLORS.ink, fontSize: 16, fontWeight: '800', marginBottom: 4 }, wideText: { color: COLORS.muted, fontSize: 13, lineHeight: 18 }, chevron: { color: '#929A96', fontSize: 29, marginLeft: 8 }, duration: { color: '#89918E', fontSize: 11, fontWeight: '700', marginTop: 6 },
  supportLink: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', minHeight: 55, marginTop: 13 }, supportLinkText: { color: COLORS.urgent, fontSize: 14, fontWeight: '800' }, disclaimer: { color: '#929995', fontSize: 11, lineHeight: 17, textAlign: 'center', paddingHorizontal: 20, marginTop: 8 }, infoLink: { alignSelf: 'center', padding: 14, marginTop: 2 }, infoLinkText: { color: COLORS.green, fontSize: 12, fontWeight: '700', textDecorationLine: 'underline' },
  backButton: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', minHeight: 44, paddingRight: 16, marginBottom: 24 }, backArrow: { color: COLORS.green, fontSize: 36, lineHeight: 36, marginRight: 6, marginTop: -3 }, backText: { color: COLORS.green, fontSize: 16, fontWeight: '700' }, pageIcon: { width: 68, height: 68, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginBottom: 18 }, pageIconText: { fontSize: 31, fontWeight: '700' }, toolTag: { color: '#667D75', fontSize: 11, fontWeight: '900', letterSpacing: 1.7, marginBottom: 9 }, pageTitle: { color: COLORS.ink, fontSize: 34, lineHeight: 40, fontWeight: '750', letterSpacing: -0.8 }, pageIntro: { color: COLORS.muted, fontSize: 16, lineHeight: 24, marginTop: 12, marginBottom: 25 },
  stepsCard: { backgroundColor: COLORS.card, borderRadius: 23, borderWidth: 1, borderColor: COLORS.border, paddingHorizontal: 18 }, stepRow: { flexDirection: 'row', paddingVertical: 20 }, divider: { borderBottomWidth: 1, borderBottomColor: '#ECEAE4' }, stepNumber: { width: 31, height: 31, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginRight: 14 }, stepNumberText: { color: '#FFF', fontSize: 13, fontWeight: '900' }, stepLabel: { color: COLORS.ink, fontSize: 16, fontWeight: '800', marginBottom: 5 }, stepText: { color: COLORS.muted, fontSize: 14, lineHeight: 21 },
  choiceList: { gap: 11 }, choiceCard: { flexDirection: 'row', backgroundColor: COLORS.card, borderRadius: 20, borderWidth: 1, borderColor: COLORS.border, padding: 17 }, actionChoice: { borderWidth: 1.5 }, choiceDot: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 13 }, choiceDotText: { color: '#FFF', fontSize: 12, fontWeight: '900' }, choiceTitle: { color: COLORS.ink, fontSize: 16, fontWeight: '800', marginBottom: 5 }, choiceText: { color: COLORS.muted, fontSize: 14, lineHeight: 21 }, inlineAction: { fontSize: 13, fontWeight: '800', marginTop: 9 },
  moduleSkillList: { gap: 10 }, moduleSkillCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card, borderRadius: 19, borderWidth: 1, borderColor: COLORS.border, padding: 15, minHeight: 88 }, moduleSkillNumber: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 13 }, moduleSkillNumberText: { fontSize: 15, fontWeight: '900' }, moduleSkillTitle: { color: COLORS.ink, fontSize: 16, fontWeight: '800', marginBottom: 4 }, moduleSkillText: { color: COLORS.muted, fontSize: 13, lineHeight: 18 },
  chooserCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card, borderRadius: 20, borderWidth: 1, borderColor: COLORS.border, padding: 15, minHeight: 91 }, chooserIcon: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginRight: 14 }, chooserIconText: { fontSize: 23, fontWeight: '800' }, chooserTitle: { color: COLORS.ink, fontSize: 16, fontWeight: '800', marginBottom: 4 }, chooserText: { color: COLORS.muted, fontSize: 13, lineHeight: 18 },
  reminderCard: { borderRadius: 19, padding: 18, marginTop: 18 }, reminderLabel: { fontSize: 10, fontWeight: '900', letterSpacing: 1.4, marginBottom: 6 }, reminderText: { color: '#56635E', fontSize: 14, lineHeight: 21 }, smallSupport: { alignSelf: 'center', padding: 18, marginTop: 6 }, smallSupportText: { color: COLORS.urgent, fontSize: 13, fontWeight: '700' },
  exerciseCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card, borderRadius: 21, borderWidth: 1, borderColor: COLORS.border, padding: 15, minHeight: 96 },
  guideCard: { alignItems: 'center', backgroundColor: COLORS.card, borderRadius: 28, borderWidth: 1, borderColor: COLORS.border, padding: 20, overflow: 'hidden' }, timerText: { color: COLORS.ink, fontSize: 36, fontWeight: '800', fontVariant: ['tabular-nums'] }, timerLabel: { color: '#8A938F', fontSize: 10, fontWeight: '800', letterSpacing: 1.5, marginTop: 2 }, breathingStage: { width: 220, height: 230, alignItems: 'center', justifyContent: 'center' }, breathingHalo: { position: 'absolute', width: 190, height: 190, borderRadius: 95 }, breathingCircle: { width: 126, height: 126, borderRadius: 63, alignItems: 'center', justifyContent: 'center', shadowColor: '#294239', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.16, shadowRadius: 16, elevation: 5 }, breathingCue: { color: '#FFF', fontSize: 17, fontWeight: '800', textAlign: 'center', paddingHorizontal: 14 }, phaseTime: { color: '#FFFFFFCC', fontSize: 13, fontWeight: '800', marginTop: 4 }, startButton: { width: '100%', minHeight: 52, borderRadius: 17, alignItems: 'center', justifyContent: 'center' }, startButtonText: { color: '#FFF', fontSize: 16, fontWeight: '800' }, resetButton: { padding: 15, paddingBottom: 0 }, resetText: { color: '#75807C', fontSize: 14, fontWeight: '700' },
  supportIcon: { width: 68, height: 68, borderRadius: 22, backgroundColor: '#A14D4718', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }, supportIconText: { color: COLORS.urgent, fontSize: 33 }, supportTitle: { color: COLORS.ink, fontSize: 34, lineHeight: 40, fontWeight: '750' }, supportCard: { backgroundColor: COLORS.card, borderRadius: 23, borderWidth: 1, borderColor: COLORS.border, padding: 20 }, supportCardLabel: { color: COLORS.urgent, fontSize: 10, fontWeight: '900', letterSpacing: 1.4 }, supportCardTitle: { color: COLORS.ink, fontSize: 24, fontWeight: '800', marginTop: 7 }, supportCardText: { color: COLORS.muted, fontSize: 14, lineHeight: 21, marginTop: 8, marginBottom: 18 }, callButton: { minHeight: 51, borderRadius: 16, backgroundColor: COLORS.urgent, alignItems: 'center', justifyContent: 'center' }, callButtonText: { color: '#FFF', fontSize: 16, fontWeight: '800' }, textButton: { minHeight: 51, borderRadius: 16, borderWidth: 1.5, borderColor: COLORS.urgent, alignItems: 'center', justifyContent: 'center', marginTop: 10 }, textButtonText: { color: COLORS.urgent, fontSize: 16, fontWeight: '800' }, dangerCard: { borderRadius: 20, backgroundColor: '#F3E6E3', padding: 19, marginTop: 14 }, dangerTitle: { color: '#703A36', fontSize: 16, fontWeight: '800' }, dangerText: { color: '#76524E', fontSize: 14, lineHeight: 21, marginTop: 7 }, dangerAction: { color: COLORS.urgent, fontSize: 15, fontWeight: '900', marginTop: 13 }, locationNote: { color: '#89918E', fontSize: 12, lineHeight: 18, textAlign: 'center', marginTop: 20, paddingHorizontal: 12 },
  infoCard: { backgroundColor: COLORS.card, borderRadius: 20, borderWidth: 1, borderColor: COLORS.border, padding: 18, marginBottom: 12 }, infoTitle: { color: COLORS.ink, fontSize: 17, fontWeight: '800', marginBottom: 8 }, infoText: { color: COLORS.muted, fontSize: 14, lineHeight: 21, marginBottom: 9 }, versionText: { color: '#89918E', textAlign: 'center', fontSize: 12, marginTop: 14 },
});
