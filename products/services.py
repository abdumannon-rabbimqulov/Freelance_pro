import torch
import torchvision.models as models
import torchvision.transforms as transforms
from PIL import Image

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model = models.resnet50(pretrained=True)
model = torch.nn.Sequential(*(list(model.children())[:-1]))
model.to(device)
model.eval()


def generate_image_vector(image_field):
    transform = transforms.Compose([
        transforms.Resize(256),
        transforms.CenterCrop(224),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
    ])

    img = Image.open(image_field).convert('RGB')
    img_t = transform(img)
    batch_t = torch.unsqueeze(img_t, 0).to(device)

    with torch.no_grad():
        vector = model(batch_t)

    return vector.flatten().cpu().numpy().tolist()