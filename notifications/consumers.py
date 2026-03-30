import json
from channels.generic.websocket import AsyncWebsocketConsumer

class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        user = self.scope['user']
        if user.is_anonymous:
            await self.close()
        else:
            self.group_name = f"user_{user.id}"
            
            # Guruhga foydalanuvchini qo'shish
            await self.channel_layer.group_add(
                self.group_name,
                self.channel_name
            )
            await self.accept()

    async def disconnect(self, close_code):
        if hasattr(self, 'group_name'):
            await self.channel_layer.group_discard(
                self.group_name,
                self.channel_name
            )

    # WebSockets dan keladigan jo'natmani xabar qabul qilish (shu joydan xabarni saqlash ham mumkin edi, biroq hozir faqat chiqaramiz)
    async def receive(self, text_data):
        pass

    # Tashqaridan guruhga (channel_layer orqali) xabar kelsa shuni foydalanuvchi(lar)ga yuborish funksiyasi
    async def send_notification(self, event):
        message = event['message']
        title = event.get('title', 'Yangi xabarnoma')
        
        # Brauzerga JSON orqali yuborish
        await self.send(text_data=json.dumps({
            'type': 'notification',
            'title': title,
            'message': message
        }))
