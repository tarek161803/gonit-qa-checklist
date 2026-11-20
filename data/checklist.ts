export type Priority = "P0" | "P1" | "P2";
export type OnlyOn = "ios" | "android";

export interface ChecklistItem {
  id: string;
  num: number;
  priority: Priority;
  text: string;
  /** Set when the test applies to one mobile platform only. */
  only?: OnlyOn;
  /** Must pass before every release: a failure breaks the app or loses revenue. */
  mustTest: boolean;
}

export interface ChecklistSection {
  title: string;
  desc: string;
  items: ChecklistItem[];
}

// A leading "!" marks a must-test item (see ChecklistItem.mustTest).
const RAW: { title: string; desc: string; items: [Priority, string, OnlyOn?][] }[] = [
  { title: "Before you start", desc: "Get the devices, build and accounts ready.", items: [
    ["P0", "Uninstall any old Gonit build, then install the build under test."],
    ["P0", "Test accounts are ready: free student, Pro student, free parent with 3+ children, Pro parent, a social-login account (Google / Apple / Facebook), a legacy account (created on an older app version), an expired-subscription account and a throwaway account for deletion."],
    ["P1", "A sandbox / test store account is signed in on the device for purchases."],
    ["P1", "A second device is available for the cross-device checks (login, XP, Restore purchase, invite link)."],
    ["P1", "The test devices include a small phone (e.g. iPhone SE), a tablet / iPad, a low-end Android (2–3 GB RAM), the oldest supported versions (iOS 16.4, Android 7.0) and the newest Android / iOS versions."],
  ]},
  { title: "App launch", desc: "The app installs and starts cleanly.", items: [
    ["P0", "!Fresh install: the splash screen finishes within a few seconds, then guest home opens with the grade picker on top (no crash or white screen)."],
    ["P0", "!The first-launch grade picker lists Grades 1–10 and can't be dismissed without choosing (no close button, Android back doesn't close it). Picking a grade closes it and loads that grade."],
    ["P0", "Fonts load correctly (no system fallback fonts flash)."],
    ["P1", "The app installs and the core flows work on the oldest supported and newest Android / iOS versions."],
    ["P1", "The App Tracking Transparency prompt shows on first launch. Tapping \"Ask App Not to Track\" leaves the app fully usable.", "ios"],
    ["P2", "The App Tracking Transparency prompt uses the privacy-friendly wording, not the \"personalized advertising\" text.", "ios"],
  ]},
  { title: "Guest experience", desc: "What a user can do without an account.", items: [
    ["P0", "!A guest can open a lesson and answer questions."],
    ["P0", "!Guest finishes one set (5 questions), then taps Continue, any lesson or Play next: a \"Sign up to Unlock More!\" alert with Register and Login shows, and no new set starts."],
    ["P0", "Kill and reopen the app after using the guest trial: the guest is still blocked."],
    ["P1", "The Register and Login buttons in the guest alert and the \"not logged in\" modal open the right screens, with empty fields."],
    ["P1", "A guest tapping Hint / Explanation sees the feature page. Its Subscribe button goes to registration."],
    ["P1", "A guest opening Settings, Leaderboard or My Profile sees the \"not logged in\" modal. Closing it goes back to home."],
    ["P1", "Kill the app with no internet and reopen it as a guest: it opens from the saved local profile with no error."],
    ["P1", "Guest with an old offline profile: the app opens with the current grade's XP at 0 (no crash)."],
    ["P2", "Log in as a free user, play a set, then log out: confirm with product whether the guest trial should already be used up (it currently is)."],
  ]},
  { title: "Registration", desc: "Create a new account with email or a social login.", items: [
    ["P0", "!Register with email and password: the account is created and the \"Are you a Parent or Student?\" modal shows on home."],
    ["P0", "!Register with Google, Apple (iOS) and Facebook: the first time, the Parent / Student modal and Add details show. A returning social user goes straight to home."],
    ["P0", "Validation: an empty email, an invalid email, an empty password and a password under 8 characters each show the right inline error."],
    ["P1", "The password field only appears once a valid email is typed. Typing \"name@gm\" shows email suggestions (gmail.com, outlook.com…), and tapping one fills the address."],
    ["P2", "The key icon in an empty password field fills a strong 16-character password, and the eye icon shows / hides it."],
    ["P1", "Registering with an email that already exists shows a clear error."],
    ["P1", "Marketing consent starts unchecked with the device region set to the UK or an EU country, and checked elsewhere (e.g. US, Bangladesh). The Terms and Privacy links in the sign-up text open."],
    ["P1", "The marketing consent choice is saved on the account. Have legal review the wording for children under 13 (COPPA / GDPR)."],
    ["P1", "The guest's progress from before registration carries over."],
  ]},
  { title: "Account setup", desc: "After sign-up: user type, name, avatar, date of birth, country and grade.", items: [
    ["P0", "!After sign-up, the \"Are you a Parent or Student?\" modal can't be dismissed. Picking one opens Add details, and only Save lands on a usable home."],
    ["P1", "Tap back on Add details, or kill and reopen the app before saving: the Parent / Student modal shows again, so setup can't be skipped."],
    ["P0", "Name, gender tab, avatar slider, date of birth, country and grade all work, and are saved."],
    ["P1", "Parent: the gender tabs read Father / Mother, parent avatars show, and there are Save and Add child buttons. Student: Boy / Girl."],
    ["P1", "An empty name or missing date of birth shows the right error. The date picker won't allow a date less than 6 years ago."],
    ["P1", "Country is pre-filled from your location, and the country picker search works. With no country detected, Save shows a clear message (it shouldn't silently do nothing)."],
    ["P2", "The name is pre-filled from the email (e.g. john.doe99@… → John) or from the social account's name."],
    ["P1", "Save with no network: an error alert shows, you stay on the screen, and Save works once the network is back."],
  ]},
  { title: "Login & password", desc: "Every way to sign in and get back into an account.", items: [
    ["P0", "!Log out, then log in with email and password."],
    ["P1", "Unknown email shows \"Incorrect email or password\" under the email field. A wrong password shows \"Incorrect password\" under the password field. Typing clears the error."],
    ["P1", "Email and password login with an email that was registered through Google / Apple / Facebook shows \"Try another login method\"."],
    ["P0", "!Google sign-in works."],
    ["P0", "!Apple sign-in works.", "ios"],
    ["P2", "Apple sign-in with \"Hide My Email\": the first sign-in creates the account, and later sign-ins (when Apple no longer sends the name) still work.", "ios"],
    ["P1", "Facebook sign-in works."],
    ["P1", "Cancelling a social sign-in returns to login with no error."],
    ["P2", "Tapping Google or Facebook twice quickly signs in once and creates one account."],
    ["P2", "Google sign-in with an email that already has a password account logs into the same account, not a new one."],
    ["P0", "!Log in on a second device: the same account, streak, XP and Pro come back."],
    ["P1", "Forgot password only appears after a valid email is typed, and opens with the email pre-filled. Empty, invalid and unregistered emails each show the right error. A valid email shows the success modal."],
    ["P1", "The reset email arrives and the link works. The new password works and the old one stops working."],
    ["P1", "On a phone, from Login or Registration you can get back to home without closing the app."],
  ]},
  { title: "Restoring a session", desc: "A logged-in user reopening the app, including on a bad network.", items: [
    ["P0", "!Kill the app and reopen it: the session is restored, and the profile, grade, XP and streak are correct."],
    ["P0", "!Airplane mode on, then cold start: the app retries a few times, then shows \"Something went wrong!\" with Try again (no endless spinner or crash)."],
    ["P0", "Turn the network back on and tap Try again: the profile loads and the app continues."],
    ["P1", "Slow or flaky network (throttled): the app recovers after an automatic retry without showing the error screen."],
    ["P0", "!Expired or revoked login (revoke the refresh token on the server): the app logs out once, cleanly, to guest home, even with several requests in flight."],
    ["P1", "Leave the app in the background for a long time: the login refreshes quietly or the app logs out cleanly, with no lost answers."],
    ["P2", "Hit the API rate limit (e.g. repeated failed logins): the server message shows and you aren't logged out."],
  ]},
  { title: "Parent & child profiles", desc: "Parents manage child profiles and switch between them.", items: [
    ["P0", "Parent with children logs in: profile select lists the parent and children, and Continue stays disabled until one is picked."],
    ["P0", "!Picking a child logs straight in as the child. Picking the parent asks for the parent's birth year (number keypad). A wrong year shows \"Wrong birth year\" and clears the field."],
    ["P1", "A parent with no children logs straight into parent home (no profile select)."],
    ["P0", "Add child: name, avatar, grade and date of birth are saved, and the child shows in the parent view. The grade starts at the parent's grade."],
    ["P1", "Add child with an empty name or no date of birth shows the right error. The date picker won't allow a date less than 6 years ago."],
    ["P0", "The new child can log in and play."],
    ["P1", "Update child: valid changes save and return home. Clearing the name shows \"Please provide a name\"."],
    ["P1", "Child details show the child's stats. Edit opens Update child, Switch opens Switch profile, and the XP row opens the per-grade XP table."],
    ["P1", "Remove child asks for the parent's full date of birth. A wrong date shows \"incorrect date of birth\" and keeps the child. The right date removes it. Cancel / X closes the modal."],
    ["P0", "!Switch profile: home, grade, XP, streak and Pro update to match the selected profile, with nothing mixed between parent and child on the same phone."],
    ["P1", "Switch profile while logged in as a child: the parent is listed (the current profile isn't), and switching to the parent asks for the birth year. A wrong year shows an error and clears the field."],
    ["P2", "A parent with no children opening Switch profile goes straight to Add child. The switch icon on home is hidden until a child exists."],
    ["P0", "!Free parent with 2 children taps \"+\" (add child): the Pro upgrade prompt shows instead. A Pro parent can add a 3rd child."],
    ["P0", "!Free parent with 3+ children (e.g. after Pro expires): the 3rd and later children are locked on home, Switch profile, Leaderboard → Select child and login profile select. The first 2 open normally."],
    ["P0", "Pro parent: every child opens with no upgrade prompt."],
    ["P1", "Logged in as a free parent's 3rd child: a blocking modal shows with Upgrade to Pro and Logout. Closing the paywall without buying brings the modal back."],
    ["P1", "!A child of a Pro parent also has Pro."],
    ["P1", "On a child profile, the analytics ID and email are the parent's, not the child's."],
    ["P1", "In a UTC+ timezone (e.g. Bangladesh) between midnight and 6 am, every date-of-birth picker shows the day you picked (not the day before), and the right date is accepted."],
  ]},
  { title: "Home screen", desc: "The main dashboard.", items: [
    ["P0", "!Home loads the header (avatar, name or \"Guest\", grade badge, current grade's XP), Continue, Explore and Streak."],
    ["P0", "!Continue opens the last lesson in progress, and its progress bar is correct. A new user sees \"Start\" with the grade's first lesson."],
    ["P1", "The Explore carousel shows courses for the current grade. \"View all lessons\" opens the Lessons tab. Tapping a loading card does nothing."],
    ["P1", "!The Upgrade banner shows for free users and guests, never for Pro. Logged-in users go to the paywall, guests go to registration. Both banner designs work."],
    ["P1", "Parent home: the children list shows progress bars. With no children, the empty state with \"add child\" shows."],
    ["P1", "Home and Lessons with no network: a clear error or retry shows, not endless loading skeletons or an empty list."],
  ]},
  { title: "Lessons & courses", desc: "Browse courses and open one.", items: [
    ["P0", "The Lessons tab lists the courses for the selected grade."],
    ["P1", "Sorting: the last-played course is first with a continue icon, then unfinished courses (most progress first), then finished ones with a tick. In-progress courses show a progress pie."],
    ["P0", "!Tapping a course opens the question flow. A partly done course resumes at the next unanswered question, and a finished course restarts from question 1."],
    ["P1", "Student / parent: the grade selector shows and changing it reloads the list. Child profile: the grade selector is hidden."],
    ["P2", "The \"New\" badge shows on courses with new questions, in both Lessons and the home Explore cards."],
    ["P0", "Practise in several grades: questions load quickly and match the grade."],
  ]},
  { title: "Tutorial (first lesson)", desc: "The guided walkthrough on the first-ever question set.", items: [
    ["P1", "First-ever lesson: 4 tutorial cards show in order (progress circles, XP reward, options, hint button), with arrows pointing at the right elements. Next moves on, and OK closes the last one."],
    ["P1", "After the first Check, one Explanation tutorial card points at the Explanation button. After Continue, no more tutorial shows."],
    ["P1", "Skip on any card ends the tutorial, and it never shows again."],
    ["P2", "The tutorial is saved per device: a new account on the same phone doesn't see it, and a reinstall shows it again. Confirm this is intended."],
    ["P2", "Hardware back with a tutorial card open closes it cleanly, and the question can still be answered.", "android"],
  ]},
  { title: "Questions & answers", desc: "The core experience: answering questions, including the 5-option layout.", items: [
    ["P0", "!5-option question: all 5 options are visible and centered, with no clipping or overlap."],
    ["P0", "4-option question (or fewer) still lays out correctly."],
    ["P0", "Single-character options (e.g. 1, A): compact boxes that wrap neatly."],
    ["P0", "Short text options (10 characters or fewer): two per row on a phone, the same width in each row."],
    ["P0", "Long text options (more than 10 characters): full width on a phone, two per row on a tablet."],
    ["P1", "Check the layouts above on a small phone, a large phone, a tablet and a large tablet / iPad."],
    ["P1", "Tablet split screen or resize: the options re-flow correctly."],
    ["P2", "Numeric options show in sensible ascending order (2, 9, 10, 12, not 10, 12, 2, 9)."],
    ["P0", "Options can't be tapped while the question image loads (a shimmer shows). A broken image still unlocks the options."],
    ["P0", "Tapping an option highlights it. Tapping another moves the highlight."],
    ["P0", "The Check button is grey until an answer is chosen, then turns green."],
    ["P0", "!Correct answer shows success. Wrong answer shows the wrong result with the correct answer."],
    ["P0", "!Typed-answer question: typing shows in the field, number questions open the numeric keyboard, Check turns green, and the field locks after Check."],
    ["P1", "Typed answer with an extra space, a leading zero or different letter case: confirm with product whether it should count as correct (it currently has to match exactly)."],
    ["P0", "Continue goes to the next question and clears the previous selection."],
    ["P1", "The progress circles in the header turn into ticks / crosses as you answer, and the XP counter moves +10 / −5 live."],
    ["P1", "Questions don't repeat within one session."],
    ["P1", "Tapping Check / Continue several times quickly records the answer once and gives XP once."],
    ["P1", "Math notation (fractions, powers) and diagrams render fully on a small phone and with the largest system font."],
    ["P1", "Background music plays during a set and dips briefly for the correct / wrong sound. Haptics play on selection. Music stops on the result screen and after leaving."],
    ["P1", "Back arrow mid-set: you go straight to the Lessons tab, and the answered questions count toward progress, XP and streak. With 0 answers, nothing is saved."],
    ["P0", "Leaving mid-set with iOS swipe-back or Android hardware back saves XP, streak and progress the same as the back arrow."],
    ["P1", "A phone call, the Home button (including 5+ minutes in the background) or a force-close in the middle of a set: the session resumes or ends as designed, with no double XP or lost results."],
    ["P0", "Lose the network mid-set: you can keep answering. At set end a clear error shows, and nothing is double-counted when you play again online."],
    ["P1", "Open a lesson with no network: a clear error with a way back shows, not an endless \"Downloading Questions…\" screen."],
  ]},
  { title: "Hint & explanation", desc: "The help features. They're Pro only. Free users see a page selling the feature.", items: [
    ["P0", "!Free user taps Hint: the hint feature page opens with a Subscribe button. No Pro content is shown."],
    ["P0", "Free user taps Explanation (after checking): the explanation feature page opens with a Subscribe button."],
    ["P1", "On the feature page, Subscribe opens the paywall, and the back arrow returns to the same question with the answer kept."],
    ["P0", "!Pro user: Hint shows inside the question (and hides on a second tap). After Check, the button becomes Explanation. Hint and explanation never show at the same time."],
    ["P1", "Pro user: a question with no hint shows \"no hint available\", and a question with no explanation doesn't crash or show a blank box."],
    ["P1", "HTML and math content renders correctly (no raw tags)."],
  ]},
  { title: "Question content spot-check", desc: "Make sure the questions themselves are right.", items: [
    ["P0", "Check about 20 questions per grade from each source (Olympiad, Logical Reasoning, AMC 8–10): the question, options and answer key are correct."],
    ["P1", "No typos and no missing images in the questions checked."],
  ]},
  { title: "Set result & paywall trigger", desc: "The end-of-set screen and what happens after it.", items: [
    ["P0", "After the last question, XP earned, time and accuracy match what actually happened. The title and picture match the accuracy band (100%, 60–99%, 20–59%, under 20%)."],
    ["P0", "!Mid-lesson, \"Play next set\" continues with the next 5 questions. After a lesson's last set, \"Play next lesson\" opens the next unfinished lesson."],
    ["P1", "\"Back to home\" goes to home, and the music has stopped."],
    ["P1", "Finish a set with no network: an error alert shows. After reconnecting and playing again, the XP and progress totals are correct."],
    ["P1", "Share opens the system share sheet with an image card (avatar, XP, time, accuracy), a message and a gonit.app link. Cancelling returns to the result screen."],
    ["P0", "!Logged-in free user with accuracy 40% or lower: the paywall opens after the set."],
    ["P0", "Free user with accuracy above 40%: no paywall. A Pro user never sees it."],
    ["P2", "Store review prompt: only on a device installed 2+ days ago and used on 3+ days, after a good set (60%+), a 3+ day streak or a first finished topic. Never after 3 wrong answers in a row, within 10 minutes of a paywall, or within 90 days of the last prompt."],
  ]},
  { title: "XP & streak", desc: "Progress tracking. XP is stored per grade.", items: [
    ["P0", "A correct answer gives +10 XP and a wrong answer −5 XP. A grade's XP never goes below 0."],
    ["P0", "Total XP equals the sum of every grade's XP. The home header and lesson counter show the current grade's XP."],
    ["P0", "Change grade: the new grade's XP starts at 0 (or its saved value), and the old grade's XP is kept."],
    ["P0", "Legacy account (created on an older app version): the XP table shows the backfilled XP, not 0."],
    ["P1", "Reinstall the app and log in again: XP totals come back from the server."],
    ["P1", "For the same grade, XP on Profile → Stats matches the XP on home and the leaderboard."],
    ["P0", "Playing on two days in a row increases the streak. Missing a day resets it to 0."],
    ["P0", "Playing twice on the same day increases the streak only once."],
    ["P1", "The streak only goes up when a set ends (or you leave with at least 1 answer), not from just opening a lesson. Today's day icon lights up, and the week strip starts on Sunday."],
    ["P2", "Leave the app in the background past a missed day, then reopen it without killing it: the streak shows 0."],
    ["P1", "Streak around midnight and after a timezone change follows the rules."],
    ["P1", "Changing the phone clock by hand can't be used to cheat the streak."],
    ["P1", "The days played this week reset at the start of a new week."],
  ]},
  { title: "Leaderboard", desc: "Country and global rankings.", items: [
    ["P0", "The Leaderboard tab loads the top 3 cards and the ranked list."],
    ["P1", "Switching the Country / Global tab moves the indicator and refreshes the list."],
    ["P1", "The leaderboard is per grade: change grade, and the new grade's ranking shows. A parent sees the selected child's grade."],
    ["P1", "Your rank shows and updates after earning XP. On a phone, a rank above 3 is pinned in yellow above the list; on a tablet it shows beside the podium. Ranks above 100 show \"100+\"."],
    ["P1", "Tapping a user opens the details sheet: avatar, name, country, streak, lessons, XP and accuracy (0% when missing)."],
    ["P0", "Privacy: only display names and avatars show. No children's full names, emails or school details."],
    ["P1", "Free user: only ranks 4–5 below the podium are clear and the rest are blurred. Tapping a blurred card opens the details paywall."],
    ["P1", "Free user scrolls down a little: the details paywall opens and the list scrolls back to the top. A Pro user scrolls freely and sees no blur."],
    ["P1", "Leaderboard details: X closes it, Subscribe opens the paywall, and the Unlock card shows your (or your child's) name, avatar and XP."],
    ["P1", "A parent can choose which child to view. A parent with no children sees the empty state with Add child."],
    ["P2", "Edge cases display correctly: 0 XP, tied scores, very long names, fewer than 3 users (empty podium slots, no crash) and a user with no country (no \"undefined\")."],
  ]},
  { title: "Subscription & purchases", desc: "Paywall, buying, restoring and renewals. Use sandbox accounts.", items: [
    ["P0", "!The paywall opens from the home and profile Upgrade banners, the hint / explanation pages, the set result, the add-child limit, the child-limit modal and the leaderboard details. Plans and prices load, and closing returns to the previous screen."],
    ["P1", "The paywall renders correctly with Yearly selected and marked \"Best value\". Selecting Monthly moves the highlight and updates the price lines. Back falls back to home when there's no history."],
    ["P1", "!Prices show in local currency in the US, UK and EU stores, with trial and renewal terms clearly shown."],
    ["P1", "On an account that already used its free trial, the paywall still says \"7 day free trial\": check what the store actually charges and flag the wording if it's wrong."],
    ["P1", "No network: the offering error shows with Retry, and tapping the buy button shows \"Select a plan\" with no crash."],
    ["P0", "!Buying a monthly or yearly plan unlocks Pro right away (no restart): the app goes to home, the Upgrade banner is gone and hints work."],
    ["P0", "!Cancelling the purchase sheet halfway: no charge, no Pro, and the app is still usable."],
    ["P1", "A failed payment: no Pro, a clear message, and the app is still usable."],
    ["P1", "Pending purchase (Play \"slow test card\"): a clear pending state shows, not a generic error, and Pro unlocks once the payment is approved.", "android"],
    ["P0", "!Log out of a Pro account, then continue as a guest and log in as a free user without killing the app: neither gets Pro."],
    ["P1", "Settings → Subscription status: the plan and renewal date are correct. During a trial the plan shows a readable name, not \"TRIAL\"."],
    ["P1", "Expired subscriber: Subscription status still shows, with the expired banner, \"Expired On\" date and Renew Now, which opens the paywall."],
    ["P1", "Manage Subscription opens the store's subscription page for Gonit."],
    ["P0", "!Settings → Restore purchase, after a reinstall and on a new device: Pro is restored to the right account."],
    ["P1", "Restore purchase on an account with no purchases, and with no network: a clear message shows, and the button can't be double-tapped while it loads."],
    ["P1", "!Pro user, airplane mode, cold start: Pro stays unlocked."],
    ["P1", "!Renewal keeps Pro. During a billing grace period, a paying user isn't locked out. A renewal or expiry while the app is open updates Pro without a restart."],
    ["P1", "Cancel, expiry or refund: the app goes back to free limits."],
    ["P2", "Influencer account (no store subscription): has Pro everywhere, and Settings shows no Subscription status."],
  ]},
  { title: "Profile & edit profile", desc: "View and edit the user's profile.", items: [
    ["P1", "The profile card, stats and XP table show correctly. The Free / Pro badge matches the plan. A parent shows Father / Mother with their email and the number of children; a child shows the parent's email."],
    ["P1", "Free users see the Upgrade banner, Pro users don't. Parent: the avatar pencil opens Edit profile and the main button opens Switch profile. Student: the button opens Edit profile."],
    ["P1", "Edit profile: avatar, name, date of birth and phone (with country from the dial-code picker) are saved and show everywhere (header, leaderboard)."],
    ["P1", "Edit profile: an empty name or an invalid phone number shows the right error. A valid save shows \"Information updated\" with Back to home."],
    ["P1", "Child profile: no Edit / Switch button, and the grade can't be changed."],
    ["P1", "Changing grade from Profile → Stats is saved and updates the lessons."],
    ["P1", "Profile edits and the grade change are still there after logging out and back in."],
  ]},
  { title: "Settings", desc: "Preferences, links and options for each account type.", items: [
    ["P1", "Sound off: no correct / wrong sounds. Background sound off: no music in lessons. Vibration off: no haptics. Each works again when turned back on, and stays set after restarting the app."],
    ["P1", "The My Profile, Contact us and Invite friend links open the correct screens."],
    ["P1", "Change password: passwords under 8 characters, a new password equal to the current one and a wrong current password each show the right error. Success shows the modal, and the new password works on the next login."],
    ["P2", "A social-login account (no password) opening Update password: the option is hidden or shows a clear message."],
    ["P1", "Child profile: Update password and Delete account are hidden. Switch profile shows and asks for the parent's birth year."],
    ["P1", "Student: Switch profile is hidden."],
    ["P1", "The Terms of use and Privacy policy links open the gonit.app pages, and they're up to date."],
    ["P2", "The app version shown matches the build under test."],
  ]},
  { title: "Contact, report & invite", desc: "Support and sharing features.", items: [
    ["P1", "Contact: an empty message and one under 20 characters each show an error. The Topic dropdown lists all topics. On success, Back to home works."],
    ["P2", "Contact submit with no network: an error alert shows and the typed message is kept."],
    ["P1", "After checking an answer, the report flag opens Report with a screenshot of the question already attached."],
    ["P1", "Report: one more photo can be added (2 maximum, then \"+\" hides). The added photo can be removed, the screenshot can't."],
    ["P1", "Report: deny photo access and tap \"+\": no crash, and you're told photo access is needed. Allowing it later in system Settings works."],
    ["P1", "Report with an empty message shows an error. Submit with no network shows the failure modal, and \"Back to practice\" returns to the question."],
    ["P2", "Report: the X closes the screen and discards the message and images."],
    ["P1", "Invite friend: Create link shows the link. Copy shows a \"copied\" toast, Share opens the share sheet (cancelling shows no error), and the QR code scans to the same link."],
    ["P2", "Opening the invite link on another device opens the app or the store. Confirm with product whether each user should get their own referral link (it's currently one shared link)."],
  ]},
  { title: "Notifications & deep links", desc: "Push notifications and opening the app from links.", items: [
    ["P1", "No push permission prompt on the first launch. It shows on the second launch, and doesn't show again after Allow or Deny."],
    ["P1", "Deny notification permission: the app works normally."],
    ["P1", "A test push arrives in the foreground, in the background and when the app is closed."],
    ["P1", "Reminders arrive at the user's local time."],
    ["P1", "Tapping a notification opens the app with no crash."],
    ["P1", "Open a gonit.onelink.me link with the app in the background and from a cold start: the target screen opens, tabs and back work afterwards, and a second link in the same session also works."],
    ["P1", "Deep-link rules: an invite link as a guest opens Registration, and while logged in stays on home. A switch-profile link as a student, child or guest goes to home."],
    ["P2", "gonit:// links open the app, and so do gonitapp:// links on Android."],
  ]},
  { title: "Analytics & privacy", desc: "Check that events are tracked and that tracking follows the rules for children's apps.", items: [
    ["P1", "Analytics user properties are set on registration, on login and at session start (Firebase DebugView)."],
    ["P1", "GA4 key events each fire once with the correct parameters: sign_up, login, lesson_start, lesson_complete, set_end, paywall_view, purchase_initiated (DebugView)."],
    ["P1", "Question events fire: lesson_question_answered, use_hint, use_explanation, onboarding_step (tutorial_completed)."],
    ["P1", "Clarity sessions record, and passwords and children's names are masked."],
    ["P1", "No Facebook App Events are sent (check with a network proxy or Events Manager)."],
    ["P2", "AppsFlyer records the install. Android ID / IMEI are not collected."],
    ["P2", "A test crash shows up in Crashlytics."],
    ["P2", "Saving a phone number without marketing consent creates no OneSignal SMS subscription (check the OneSignal dashboard)."],
    ["P2", "App info → Permissions shows no Microphone permission (the app never records audio).", "android"],
    ["P2", "The photo permission prompt wording matches how photos are used (report attachments).", "ios"],
  ]},
  { title: "Security", desc: "Accounts can't reach each other's data. Needs a proxy or API tool.", items: [
    ["P0", "!Change a user or child ID in an API request: the server refuses access to another account's data."],
    ["P1", "After logout, the old login token is rejected by the API."],
    ["P1", "Login tokens are kept in the Keychain / Keystore (secure store), not in plain storage."],
  ]},
  { title: "Language, UI & accessibility", desc: "Look-and-feel and accessibility on every screen.", items: [
    ["P1", "No raw translation keys or untranslated placeholders show on any screen."],
    ["P1", "Nothing is hidden under the notch, the Dynamic Island or the Android nav bar."],
    ["P1", "Small phone (iPhone SE), large phone and tablet / iPad layouts fit, with no clipped buttons or text."],
    ["P1", "iPad in landscape and split view: home, questions, the paywall and Settings adapt with no clipping. Phones stay in portrait.", "ios"],
    ["P2", "Dark mode and the largest system font size: everything is readable and nothing overlaps."],
    ["P2", "TalkBack / VoiceOver on the question screen reads out the answer options and buttons with meaningful labels."],
    ["P2", "Text contrast is readable, and buttons are at least about 44 pt / 48 dp."],
    ["P2", "No dead buttons or blank screens for features that aren't built yet (e.g. the home notification bell)."],
  ]},
  { title: "Stability & performance", desc: "Things that break in real-world use.", items: [
    ["P1", "The hardware back button behaves correctly on every screen.", "android"],
    ["P0", "!Upgrade test: install the previous release, log in, then update to the build under test. The login, streak, XP, grade, settings and Pro are kept."],
    ["P1", "In-app update (release builds): Android shows the flexible Play update. iOS shows the \"Update Available\" alert, where Update opens the App Store and Cancel keeps the app usable."],
    ["P1", "!A 20-minute session on a low-end Android (2–3 GB RAM): no freezes, ANRs or crashes, and scrolling stays smooth.", "android"],
    ["P1", "Slow network (3G simulation): loading states and timeouts are clear, and retries work."],
  ]},
  { title: "Logout & delete account (do last)", desc: "Destructive actions. Use a throwaway account.", items: [
    ["P0", "Logout asks \"Are you sure?\". No keeps you logged in. Yes goes to guest home with the grade picker open, signs out social logins too, and works in airplane mode."],
    ["P1", "After logout, and after force-closing and reopening, no personal data from the previous account (grade, XP, streak, progress) shows anywhere."],
    ["P0", "!Delete account asks for the account's date of birth. An empty or wrong date shows \"incorrect date of birth\" and nothing is deleted. No closes the modal. The right date deletes the account and logs out."],
    ["P1", "Delete account on an account with no saved date of birth (e.g. social sign-up) can still be confirmed (App Store requirement)."],
    ["P0", "Logging in with the deleted account fails."],
  ]},
];

// Results are keyed by a hash of the test text, so adding, removing or reordering tests
// doesn't shift saved results onto the wrong test. Editing a test's text resets its result.
const hash = (s: string) => {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
};

let counter = 0;
export const SECTIONS: ChecklistSection[] = RAW.map((sec) => ({
  title: sec.title,
  desc: sec.desc,
  items: sec.items.map(([priority, raw, only]) => {
    const mustTest = raw.startsWith("!");
    const text = mustTest ? raw.slice(1) : raw;
    return { id: `t-${hash(text)}`, num: ++counter, priority, text, only, mustTest };
  }),
}));

export const TOTAL_ITEMS = counter;
