import os
import win32com.client

ppt_path = os.path.abspath('BatchHub_Presentation.pptx')
output_dir = os.path.abspath('slides_preview')
os.makedirs(output_dir, exist_ok=True)

ppt_app = win32com.client.Dispatch('PowerPoint.Application')
ppt_app.Visible = 1

try:
    presentation = ppt_app.Presentations.Open(ppt_path, ReadOnly=True, Untitled=False, WithWindow=False)
    for i, slide in enumerate(presentation.Slides):
        slide_img = os.path.join(output_dir, f'slide_{i+1}.png')
        slide.Export(slide_img, 'PNG', 1920, 1440)
        print(f"Exported slide {i+1} to {slide_img}")
    presentation.Close()
finally:
    ppt_app.Quit()

print("All slides exported successfully.")
