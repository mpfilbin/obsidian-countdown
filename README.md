# Obsidian Countdown Timer

A plugin for [Obsidian](https://obsidian.md) that adds countdown timer functionality to your notes using code fence syntax.

## Installation

### From Obsidian Community Plugins

1. Open Obsidian Settings
2. Go to Community Plugins and disable Safe Mode
3. Click Browse and search for "Countdown Timer"
4. Install the plugin and enable it

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