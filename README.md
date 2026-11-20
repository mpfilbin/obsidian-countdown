# Obsidian Countdown Timer

A plugin for [Obsidian](https://obsidian.md) that adds countdown timer functionality to your notes using code fence syntax.

## Installation

### Using BRAT (Recommended)

[BRAT](https://github.com/TfTHacker/obsidian42-brat) (Beta Reviewers Auto-update Tool) allows you to install and update beta plugins directly from GitHub.

1. Install the BRAT plugin from Obsidian Community Plugins
2. Open BRAT settings (Settings > BRAT)
3. Click "Add Beta Plugin"
4. Enter this repository URL: `mfilbin/obsidian-countdown`
5. Click "Add Plugin"
6. Enable the plugin in Settings > Community Plugins

BRAT will automatically check for updates and notify you when new versions are available.

### Manual Installation

1. Download `main.js`, `manifest.json`, and `styles.css` from the [latest release](https://github.com/mfilbin/obsidian-countdown/releases/latest)
2. Create a folder called `obsidian-countdown` in your vault's `.obsidian/plugins/` directory
3. Copy the downloaded files into this folder
4. Reload Obsidian and enable the plugin in Settings > Community Plugins

## Usage

Create a countdown timer by adding a `countdown` code block with YAML configuration:

````markdown
```countdown
title: New Year Countdown
target: 2026-01-01
```
````

### Configuration Options

| Option | Required | Description |
|--------|----------|-------------|
| `title` | Yes | Display title for the countdown |
| `target` | One of `target` or `duration` | Target date/time to count down to |
| `duration` | One of `target` or `duration` | Duration to count down from |
| `started` | No | When a `duration` timer was started. Written by the Start button; only valid with `duration` |
| `format` | No | Custom display format (strftime-style) |

**Note:** You must specify either `target` or `duration`, but not both.

### Target Date Formats

The `target` option supports multiple date formats:

**ISO 8601:**
```yaml
target: 2026-12-25
target: 2026-12-25T10:30:00
target: 2026-12-25T10:30:00Z
target: 2026-12-25T10:30:00+05:00
```

**Natural Language:**
```yaml
target: December 25, 2026
target: Dec 25, 2026
target: 25 December 2026
```

**With Time:**
```yaml
target: December 25, 2026 at 10:30
target: December 25, 2026 10:30 PM
```

**US Format:**
```yaml
target: 12/25/2026
```

### Duration Format

The `duration` option accepts combinations of days, hours, minutes, and seconds:

```yaml
duration: 30m          # 30 minutes
duration: 1h30m        # 1 hour and 30 minutes
duration: 2d5h30m45s   # 2 days, 5 hours, 30 minutes, 45 seconds
```

Units must be in descending order: `d` (days), `h` (hours), `m` (minutes), `s` (seconds).

#### Starting and resetting duration timers

A duration timer shows its full duration with a **Start** button. Pressing it writes the start time into the code block, so the timer keeps counting down when you switch between reading view and Live Preview, edit the note, or close and reopen it:

````markdown
```countdown
title: Pomodoro
duration: 25m
started: 2026-11-20T14:30:00.000Z
```
````

Press **Reset** to remove the `started` line and return to the idle state. You can also add, edit or delete `started` by hand (ISO 8601; include `Z` or an offset to be timezone-exact).

The "completed" notification appears only if Obsidian is showing the timer when it finishes. A timer that finished while the note was closed shows as complete when you reopen it. The button needs the block to sit directly in the note, so it can't update timers nested inside quotes or callouts.

### Custom Format

Use strftime-style format codes to customize the display:

| Code | Description |
|------|-------------|
| `%d` | Days (not zero-padded) |
| `%H` | Hours (zero-padded, 2 digits) |
| `%M` | Minutes (zero-padded, 2 digits) |
| `%S` | Seconds (zero-padded, 2 digits) |
| `%%` | Literal percent sign |

**Note:** If `%d` is not included in the format, hours will include the total hours (days * 24 + hours).

**Examples:**

````markdown
```countdown
title: Meeting Countdown
target: 2026-03-15T14:00:00
format: "%d days, %H:%M:%S"
```
````

````markdown
```countdown
title: Pomodoro Timer
duration: 25m
format: "%M:%S"
```
````

### Default Format

If no format is specified, the default format is: `0d 00h 00m 00s`

## Examples

### Count down to a specific date

````markdown
```countdown
title: Project Deadline
target: March 15, 2026
```
````

### Pomodoro timer

````markdown
```countdown
title: Focus Time
duration: 25m
format: "%M:%S remaining"
```
````

### Event countdown with custom format

````markdown
```countdown
title: Conference Starts In
target: 2026-06-01T09:00:00
format: "%d days %H hours %M minutes"
```
````

## License

[MIT](LICENSE)