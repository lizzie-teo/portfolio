# Overnight runs

How to let Claude Code work while you sleep — and why a sleeping laptop can't.

## The constraint

A Claude Code session in your terminal is an ordinary local process. When
macOS sleeps, the process is suspended mid-turn; nothing runs, nothing is
lost, and when the machine wakes the session resumes (often with a
timed-out API connection that retries). So "kick off a big task and close
the lid" silently pauses the work for the whole night. There are two ways
around it: keep the Mac awake, or don't run the work on the Mac at all.

## Option 1 — keep the Mac awake (occasional use)

For the rare "let this big session finish overnight" case:

1. Plug the laptop in.
2. In a second terminal, run:

   ```sh
   caffeinate -dimsu
   ```

   This blocks display, idle, disk, and system sleep until you Ctrl-C it.
   Scope it to the night, not to a setting you'll forget to undo.
3. Leave the lid open. Closing the lid forces sleep regardless of
   `caffeinate`, unless the Mac is in clamshell mode (external display +
   power + keyboard/mouse).

A standing alternative is Settings → Battery → Options → "Prevent
automatic sleeping when the display is off", but a one-shot `caffeinate`
is better hygiene — it can't outlive the task.

Caveats: the machine stays on all night (heat, battery wear if unplugged),
the session still dies if the laptop reboots or Wi-Fi drops for long, and
nobody is there to answer questions — so give the full task spec up front
and tell Claude to proceed without asking.

## Option 2 — run it in the cloud (the real answer)

Anything genuinely long-running shouldn't depend on your laptop's power
state at all.

| Shape | Use | How |
|---|---|---|
| Interactive session you want to walk away from | Claude Code on the web | Start the session at claude.ai/code — it runs in a cloud sandbox that keeps going after you close the laptop. Check results in the morning. |
| Recurring job ("every night at 2am, do X") | Scheduled cloud agent | `/schedule` sets up a routine that fires on a cron in the cloud. Also handles one-shots ("run this once at 3am"). |
| One long task delegated from a local session | Remote agent run | Ask Claude to launch the agent remotely; it executes in a cloud environment instead of on your machine. |

For this portfolio, plausible overnight shapes would be a nightly
`visual-qa` sweep across all routes, or a large refactor scoped and
kicked off before bed. Both fit the scheduled or remote shape better than
a caffeinated laptop.

## Rules of thumb

- **One night, one task, machine can stay on** → `caffeinate -dimsu` and
  lid open.
- **Recurring, or you want the lid closed** → cloud (`/schedule` or a web
  session).
- **Either way**: overnight work is autonomous work. Give the full task
  spec in the first message, state what "done" looks like, and say
  "proceed without asking" — a question asked at 3am blocks until morning.

Related: `.docs/token-playbook.md` → "Fable vs Opus: the judgment-density
rule" notes that very long autonomous runs are the one case where Fable's
premium can be worth paying even at volume.
