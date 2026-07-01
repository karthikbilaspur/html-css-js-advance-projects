import os

# Config
START = 11
END = 99
TOTAL = 100
BASE_DIR = "html-css"
AUTHOR = "HTML 100 Codes Vault"

# HTML template with JS auto-nav
HTML_TEMPLATE = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Code {num}: {title} - HTML 100 Codes</title>
  <meta name="description" content="{desc}. Code {num} of HTML 100 Codes Vault.">
  <meta name="author" content="{author}">
  <link rel="stylesheet" href="code{num_str}.css">
</head>
<body bgcolor="#f5f5f5" text="#222222" link="#0066cc" vlink="#663399">
  
  <center>
    <table width="90%" cellpadding="20" cellspacing="0" border="1" bordercolor="#cccccc" bgcolor="#ffffff">
      <tr>
        <td>
          <header>
            <p><a href="../index.html">← Back to All Codes</a></p>
            <h1 align="center"><font color="#1a1a1a">Code {num}: {title}</font></h1>
            <hr size="2" color="#e0e0e0">
            <blockquote>
              <p>{what_it_does}</p>
            </blockquote>
          </header>

          <main>
            <section>
              <h2><font color="#333333">What it does</font></h2>
              <blockquote>
                <p>{details}</p>
              </blockquote>
            </section>

            <section>
              <h2><font color="#333333">Live Demo</font></h2>
              <blockquote>
                <!-- TODO: Add your demo HTML here -->
                <p>Demo coming soon for Code {num}</p>
              </blockquote>
            </section>

            <section>
              <h2><font color="#333333">The Code</font></h2>
              <blockquote>
                <pre><code><!-- TODO: Add your code snippet here --></code></pre>
              </blockquote>
            </section>

            <section>
              <h2><font color="#333333">Key Rules</font></h2>
              <blockquote>
                <ul>
                  <!-- TODO: Add your rules -->
                  <li>Rule 1 for Code {num}</li>
                  <li>Rule 2 for Code {num}</li>
                </ul>
              </blockquote>
            </section>

            <!-- AUTO NAV + FOOTER - DO NOT EDIT -->
            <nav id="vault-nav"></nav>
            <footer id="vault-footer"></footer>
          </main>
        </td>
      </tr>
    </table>
  </center>

<script>
(function() {{
  const path = window.location.pathname;
  const match = path.match(/code(\\d{{2}})\\/code\\1\\.html$/);
  if (!match) return;
  const current = parseInt(match[1], 10), total = {total};
  const prev = current === 1? total : current - 1;
  const next = current === total? 1 : current + 1;
  const pad = (n) => String(n).padStart(2, '0');
  const prevStr = pad(prev), nextStr = pad(next);

  document.getElementById('vault-nav').innerHTML = `
    <hr size="1" color="#e0e0e0">
    <p align="center">
      <b><a href="../code${{prevStr}}/code${{prevStr}}.html">← Prev: Code ${{prev}}</a></b> |
      <b><a href="../index.html">Home</a></b> |
      <b><a href="../code${{nextStr}}/code${{nextStr}}.html">Next: Code ${{next}} →</a></b>
    </p>`;

  document.getElementById('vault-footer').innerHTML = `
    <hr size="1" color="#e0e0e0">
    <p align="center">
      <small><font color="#666666">
        Code ${{current}} of ${{total}} | HTML 100 Codes Vault<br>
        &copy; 2026 KarthikCodingSolutions. All Rights Reserved.
      </font></small>
    </p>`;
}})();
</script>

</body>
</html>
"""

# Titles/desc data - replace with your actual content
CODE_DATA = {
    11: {"title": "Accordion Menu", "desc": "Collapsible accordion menu with CSS only", "what": "Creates expandable FAQ sections", "details": "Uses checkbox hack for toggle"},
    12: {"title": "Pricing Table", "desc": "Responsive pricing table layout", "what": "Displays tiered pricing plans", "details": "Uses flexbox and CSS variables"},
    # ... add entries for 13-99 or use placeholders
}

def get_code_data(num):
    """Get data for code number, fallback to placeholder"""
    return CODE_DATA.get(num, {
        "title": f"Code {num} Title",
        "desc": f"Description for Code {num}",
        "what": f"This project demonstrates Code {num}",
        "details": "Details coming soon"
    })

def main():
    for num in range(START, END + 1):
        num_str = f"{num:02d}"  # 11 -> "11", 9 -> "09"
        folder = f"code{num_str}"
        filepath = os.path.join(BASE_DIR, folder, f"code{num_str}.html")
        
        # Create folder if missing
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        
        # Get content
        data = get_code_data(num)
        
        # Fill template
        html = HTML_TEMPLATE.format(
            num=num,
            num_str=num_str,
            title=data["title"],
            desc=data["desc"],
            what_it_does=data["what"],
            details=data["details"],
            author=AUTHOR,
            total=TOTAL
        )
        
        # Write file
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(html)
        
        print(f"Created: {filepath}")

    print(f"\nDone. Generated code{START:02d} to code{END:02d}")

if __name__ == "__main__":
    main()