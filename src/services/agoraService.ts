// src/services/agoraService.ts

import AgoraRTC from 'agora-rtc-sdk-ng';
import type {
  IAgoraRTCClient,
  ICameraVideoTrack,
  IMicrophoneAudioTrack,
  UID
} from 'agora-rtc-sdk-ng';

class AgoraService {
  private client: IAgoraRTCClient | null = null;
  private localAudioTrack: IMicrophoneAudioTrack | null = null;
  private localVideoTrack: ICameraVideoTrack | null = null;

  async joinChannel(appId: string, channel: string, token: string, uid: UID) {
    this.client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
    
    await this.client.join(appId, channel, token, uid);
    
    [this.localAudioTrack, this.localVideoTrack] = 
      await AgoraRTC.createMicrophoneAndCameraTracks();
    
    await this.client.publish([this.localAudioTrack, this.localVideoTrack]);
  }

  async leaveChannel() {
    if (this.localAudioTrack) {
      this.localAudioTrack.close();
    }
    if (this.localVideoTrack) {
      this.localVideoTrack.close();
    }
    if (this.client) {
      await this.client.leave();
    }
  }
}

export default new AgoraService();
