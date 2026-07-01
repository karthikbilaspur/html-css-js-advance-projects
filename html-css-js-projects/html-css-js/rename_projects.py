import os
import re
from pathlib import Path

# Run this script from inside your 'html-css-js' folder
root_dir = Path('.')

def pad_number(num_str, width=2):
    """Pad number with zeros. width=2 gives 01-99, width=3 gives 001-999"""
    return f"{int(num_str):0{width}d}"

def rename_project_folders():
    pattern = re.compile(r'^code(\d+)$')

    # Get all matching folders first so we don't modify while iterating
    folders_to_rename = []
    for item in root_dir.iterdir():
        if item.is_dir():
            match = pattern.match(item.name)
            if match:
                old_num = match.group(1)
                new_num = pad_number(old_num)
                new_name = f"code{new_num}"
                if item.name!= new_name:
                    folders_to_rename.append((item, old_num, new_num, new_name))

    # Sort by number descending so we rename code9 before code1
    # Prevents conflicts if you already have both code1 and code01
    folders_to_rename.sort(key=lambda x: int(x[1]), reverse=True)

    for old_path, old_num, new_num, new_name in folders_to_rename:
        new_path = root_dir / new_name
        print(f"Renaming folder: {old_path.name} -> {new_name}")

        # First rename files inside
        for file in old_path.glob(f'code{old_num}.*'):
            new_file_name = file.name.replace(f'code{old_num}', f'code{new_num}')
            new_file_path = file.parent / new_file_name
            print(f" Renaming file: {file.name} -> {new_file_name}")
            file.rename(new_file_path)

        # Then rename the folder itself
        old_path.rename(new_path)

    print(f"\nDone! Renamed {len(folders_to_rename)} folders.")

if __name__ == "__main__":
    print("This will rename code1-code99 to code01-code99")
    confirm = input("Run from html-css-js folder. Continue? y/n: ")
    if confirm.lower() == 'y':
        rename_project_folders()
    else:
        print("Cancelled")