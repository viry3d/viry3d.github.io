export class VRDate {
	year = 0;
	month = 0;
	day = 0;
	hour = 0;
	minute = 0;
	second = 0;
	milli_second = 0;
	week_day = 0;
}

export class Time {
	static GetTime(): number {
		return Time.m_time;
	}

	static GetDeltaTime(): number {
		return Time.m_time_delta;
	}

	static GetRealTimeSinceStartup(): number {
		if(Time.m_time_startup == 0) {
			Time.m_time_startup = Time.GetTimeMS();
		}

		let time = Time.GetTimeMS() - Time.m_time_startup;

		return time / 1000.0;
	}

	static GetDate(): VRDate {
		let date = new VRDate();
		let d = new Date(Date.now());

		date.year = d.getFullYear();
		date.month = d.getMonth() + 1;
		date.day = d.getDate();
		date.hour = d.getHours();
		date.minute = d.getMinutes();
		date.second = d.getSeconds();
		date.milli_second = d.getMilliseconds();
		date.week_day = d.getDay();

		return date;
	}

	static GetFPS(): number {
		return Time.m_fps;
	}

	static Update() {
		let time = Time.GetRealTimeSinceStartup();
		Time.m_time_delta = time - Time.m_time;
		Time.m_time = time;

		if(Time.m_time_record < 0) {
			Time.m_time_record = Time.GetRealTimeSinceStartup();
			Time.m_frame_record = Time.m_frame_count;
		}

		let frame = Time.m_frame_count;
		if(time - Time.m_time_record >= 1) {
			Time.m_fps = frame - Time.m_frame_record;
			Time.m_time_record = time;
			Time.m_frame_record = frame;
		}

		Time.m_frame_count++;
	}

	private static GetTimeMS(): number {
		return Date.now();
	}

	private static m_time_startup = 0;
	private static m_time_delta = 0;
	private static m_time_record = -1;
	private static m_frame_count = 0;
	private static m_frame_record = 0;
	private static m_time = 0;
	private static m_fps = 0;
	private static m_render_time = 0;
	private static m_update_time = 0;
}